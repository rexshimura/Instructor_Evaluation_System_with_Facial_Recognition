import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import pool from '../server/db/pool.js';
import { rekClient, COLLECTION_ID } from '../rekognitionClient.js';
import {
    IndexFacesCommand,
    CreateFaceLivenessSessionCommand,
    GetFaceLivenessSessionResultsCommand,
    SearchFacesByImageCommand,
} from '@aws-sdk/client-rekognition';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

/**
 * Endpoint 1: Register an Instructor's Face
 */
router.post('/register-face', upload.single('image'), async (req, res) => {
    const { ins_id, created_by } = req.body;
    const imagePath = req.file.path;

    if (!ins_id || !created_by || !req.file) {
        return res.status(400).json({ error: 'Missing ins_id, created_by, or image' });
    }

    try {
        const imageBytes = fs.readFileSync(imagePath);

        const indexFacesCommand = new IndexFacesCommand({
            CollectionId: COLLECTION_ID,
            Image: { Bytes: imageBytes },
            ExternalImageId: ins_id,
            MaxFaces: 1,
            QualityFilter: 'AUTO',
        });
        const indexFacesResponse = await rekClient.send(indexFacesCommand);

        if (indexFacesResponse.FaceRecords && indexFacesResponse.FaceRecords.length > 0) {
            const awsFaceId = indexFacesResponse.FaceRecords[0].Face.FaceId;

            const dbResult = await pool.query(
                "SELECT * FROM instructor_face_create($1, $2, $3)",
                [ins_id, awsFaceId, created_by]
            );

            res.status(201).json({
                message: 'Face registered successfully',
                awsFaceId: awsFaceId,
                dbRecord: dbResult.rows[0]
            });
        } else {
            res.status(400).json({ error: 'No face detected or image quality is too low.' });
        }
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Server error during face registration', details: err.message });
    } finally {
        fs.unlinkSync(imagePath);
    }
});

/**
 * Endpoint 2: Create a Liveness Session for Verification
 */
router.get('/create-liveness-session', async (req, res) => {
    console.log("✅ Creating liveness session with S3 bucket...");

    try {
        const command = new CreateFaceLivenessSessionCommand({
            OutputConfig: {
                S3Bucket: "instructor-eval-liveness-audit-bucket",
                S3KeyPrefix: "liveness-sessions/"
            }
        });

        const response = await rekClient.send(command);
        console.log("✅ Liveness session created:", response.SessionId);

        res.json({
            sessionId: response.SessionId
        });
    } catch (err) {
        console.error('❌ Liveness Session Error:', err);
        res.status(500).json({
            error: 'Could not create liveness session',
            details: err.message
        });
    }
});

/**
 * Endpoint 3: Verify the Liveness Check and Find the Instructor
 */
router.post('/get-verification-result', async (req, res) => {
    const { sessionId } = req.body;
    console.log("🔍 Getting verification results for session:", sessionId);

    try {
        const livenessCommand = new GetFaceLivenessSessionResultsCommand({
            SessionId: sessionId
        });
        const livenessResponse = await rekClient.send(livenessCommand);

        console.log("📊 Liveness response:", {
            status: livenessResponse.Status,
            confidence: livenessResponse.Confidence
        });

        if (livenessResponse.Status !== 'SUCCESS') {
            return res.status(400).json({
                isMatch: false,
                error: `Liveness check failed with status: ${livenessResponse.Status}`
            });
        }

        if (!livenessResponse.Confidence || livenessResponse.Confidence < 95) {
            return res.status(400).json({
                isMatch: false,
                error: `Liveness confidence too low: ${livenessResponse.Confidence}`
            });
        }

        if (!livenessResponse.ReferenceImage || !livenessResponse.ReferenceImage.Bytes) {
            return res.status(400).json({
                isMatch: false,
                error: 'No reference image available from liveness session'
            });
        }

        const searchCommand = new SearchFacesByImageCommand({
            CollectionId: COLLECTION_ID,
            Image: { Bytes: livenessResponse.ReferenceImage.Bytes },
            MaxFaces: 1,
            FaceMatchThreshold: 90,
            QualityFilter: 'HIGH'
        });

        const searchResponse = await rekClient.send(searchCommand);
        console.log("🔎 Face search results:", {
            matches: searchResponse.FaceMatches?.length,
            similarity: searchResponse.FaceMatches?.[0]?.Similarity
        });

        if (searchResponse.FaceMatches && searchResponse.FaceMatches.length > 0) {
            const match = searchResponse.FaceMatches[0];
            const ins_id = match.Face.ExternalImageId;

            const instructorResult = await pool.query(
                "SELECT ins_id, ins_fname, ins_mname, ins_lname, ins_email, ins_dept FROM instructor WHERE ins_id = $1",
                [ins_id]
            );

            if (instructorResult.rows.length === 0) {
                return res.status(404).json({
                    isMatch: false,
                    error: 'Face matched but instructor not found in database'
                });
            }

            // --- LOGGING THE VERIFIED USER IN THE BACKEND ---
            console.log("✅ User Verified in DB:", instructorResult.rows[0]);
            // -------------------------------------------------

            res.json({
                isMatch: true,
                instructor: instructorResult.rows[0],
                confidence: match.Similarity,
                livenessConfidence: livenessResponse.Confidence
            });

        } else {
            res.status(404).json({
                isMatch: false,
                error: 'Face not recognized in our system. Please register first.'
            });
        }

    } catch (err) {
        console.error('❌ Verification Error:', err);
        res.status(500).json({
            error: 'Server error during verification',
            details: err.message
        });
    }
});

export default router;