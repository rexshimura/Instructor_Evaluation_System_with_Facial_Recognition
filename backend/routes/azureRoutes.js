import express from 'express';
import { FaceClient } from '@azure/cognitiveservices-face';
import { Readable } from 'stream';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
// Load the common JS module using require to avoid ESM conflicts
const msRest = require('@azure/ms-rest-js');

// Use ApiKeyCredentials which is guaranteed to be present
const { ApiKeyCredentials } = msRest;

const router = express.Router();

// --- Azure Configuration from .env ---
const key = process.env.FACE_API_KEY;
const endpoint = process.env.FACE_ENDPOINT;
const personGroupId = process.env.PERSON_GROUP_ID;

if (!key || !endpoint || !personGroupId) {
    console.error("❌ ERROR: Azure credentials are not fully defined in environment variables.");
}

// Configure the Azure client with standard headers
const credentials = new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': key } });
const client = new FaceClient(credentials, endpoint);

// Utility: Convert Base64 string back to a Buffer Stream
const base64ToStream = (base64) => {
    const buffer = Buffer.from(base64, 'base64');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
};

// --- AZURE API ENDPOINTS ---

/**
 * 1. Ensures the Person Group exists and creates it if not.
 * ROUTE: POST /azure/group/ensure-exists
 */
router.post('/group/ensure-exists', async (req, res) => {
    try {
        await client.personGroup.get(personGroupId);
        console.log(`[Azure] Group '${personGroupId}' exists.`);
        return res.json({ success: true, message: "Person Group already exists." });
    } catch (error) {
        const errorCode = error.code || (error.body?.error?.code);

        if (errorCode === 'PersonGroupNotFound') {
            try {
                await client.personGroup.create(personGroupId, { name: personGroupId });
                console.log(`[Azure] Group '${personGroupId}' created successfully.`);
                return res.json({ success: true, message: "Person Group created." });
            } catch (createError) {
                console.error("❌ Error creating Person Group:", createError);
                return res.status(500).json({ success: false, message: "Failed to create Person Group.", details: createError.message });
            }
        }

        // Enhanced Error Logging for debugging 500 errors
        console.error("❌ Error initializing Azure Person Group:", error);
        if (error.statusCode === 401) {
            console.error("⚠️ AUTH ERROR: Check FACE_API_KEY and FACE_ENDPOINT in .env");
        }

        return res.status(500).json({
            success: false,
            message: "Error initializing Azure Person Group.",
            details: error.message || error.body?.error?.message || "Unknown Azure error"
        });
    }
});

/**
 * 2. Creates a new Azure Person (Instructor).
 * ROUTE: POST /azure/person/create
 */
router.post('/person/create', async (req, res) => {
    try {
        const { name, userData } = req.body;
        const person = await client.personGroup.createPerson(personGroupId, { name: name, userData: userData });
        console.log(`[Azure] Created Person: ${person.personId} for instructor ${userData}`);
        res.json({ success: true, personId: person.personId });
    } catch (error) {
        console.error("❌ Error creating Person:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 3. Deletes specific faces from a Person.
 * ROUTE: POST /azure/person/delete-faces
 */
router.post('/person/delete-faces', async (req, res) => {
    try {
        const { personId, faceIds } = req.body;
        if (!personId || !faceIds || faceIds.length === 0) {
            return res.json({ success: true, message: "No faces to delete." });
        }

        for (const faceId of faceIds) {
            try {
                await client.personGroup.deleteFace(personGroupId, personId, faceId);
            } catch (innerError) {
                console.warn(`⚠️ Could not delete face ${faceId}: ${innerError.message}`);
            }
        }
        console.log(`[Azure] Finished deletion attempts for ${faceIds.length} faces.`);
        res.json({ success: true, message: `Finished face deletion process.` });
    } catch (error) {
        console.error("❌ Error during face deletion process:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 4. Adds a face image to a Person.
 * ROUTE: POST /azure/person/add-face
 */
router.post('/person/add-face', async (req, res) => {
    try {
        const { personId, base64Image } = req.body;
        if (!personId || !base64Image) return res.status(400).json({ message: "Missing data" });

        const imageStream = base64ToStream(base64Image);
        const faceResult = await client.personGroup.addFaceFromStream(personGroupId, personId, imageStream);

        console.log(`[Azure] Added face: ${faceResult.persistedFaceId} to Person ${personId}`);
        res.json({ success: true, persistedFaceId: faceResult.persistedFaceId });
    } catch (error) {
        console.error("❌ Error adding face:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 5. Trains the Person Group.
 * ROUTE: POST /azure/group/train
 */
router.post('/group/train', async (req, res) => {
    try {
        await client.personGroup.train(personGroupId);
        console.log(`[Azure] Training initiated for '${personGroupId}'.`);
        res.json({ success: true, message: "Training initiated." });
    } catch (error) {
        console.error("❌ Error training Person Group:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * 6. Identifies faces in an image.
 * ROUTE: POST /azure/identify
 */
router.post('/identify', async (req, res) => {
    try {
        const { base64Image } = req.body;
        if (!base64Image) return res.status(400).json({ message: "Image required" });

        const imageStream = base64ToStream(base64Image);

        // Step 1: Detect faces
        const detectedFaces = await client.face.detectWithStream(imageStream, {
            returnFaceId: true,
            returnFaceLandmarks: false
        });

        if (detectedFaces.length === 0) {
            return res.json({ success: true, matches: [] });
        }

        // Step 2: Identify faces
        const faceIds = detectedFaces.map(face => face.faceId);
        const identifyResults = await client.face.identify(faceIds, {
            personGroupId: personGroupId,
            maxNumOfCandidatesReturned: 1,
            confidenceThreshold: 0.5
        });

        // Step 3: Match results to Person data
        const matches = [];
        for (const result of identifyResults) {
            if (result.candidates.length > 0) {
                const candidate = result.candidates[0];
                try {
                    const person = await client.personGroup.getPerson(personGroupId, candidate.personId);
                    matches.push({
                        faceId: result.faceId,
                        personId: candidate.personId,
                        name: person.name,
                        userData: person.userData, // This is the ins_id
                        confidence: candidate.confidence
                    });
                } catch (personError) {
                    console.warn(`⚠️ Identified person ${candidate.personId} but could not fetch details.`);
                }
            }
        }

        res.json({ success: true, matches });
    } catch (error) {
        console.error("❌ Error identifying faces:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;