import 'dotenv/config';
import { Router } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import pool from '../server/db/pool.js'; // Make sure this path is correct!

const router = Router();
const LUXAND_API_KEY = process.env.LUXAND_API_KEY;

/**
 * @route   POST /instructor-faces/register
 * @desc    Register a new face, REPLACING any old ones.
 * @access  Public (or add auth)
 * @body    { ins_id: number, imageBase64: string }
 */
router.post('/register', async (req, res, next) => {
    const { ins_id, imageBase64 } = req.body;

    if (!ins_id || !imageBase64) {
        return res.status(400).json({ message: 'Instructor ID (ins_id) and imageBase64 are required.' });
    }
    if (!LUXAND_API_KEY) {
        return res.status(500).json({ message: 'Face registration service is not configured.' });
    }

    const dbClient = await pool.connect();

    try {
        // === STEP 1: Get Instructor Info & Check for Existing Luxand Subject ID ===
        const instructorResult = await dbClient.query(
            'SELECT ins_fname, ins_lname FROM instructor WHERE ins_id = $1',
            [ins_id]
        );
        if (instructorResult.rows.length === 0) {
            return res.status(404).json({ message: `Instructor with ID ${ins_id} not found.` });
        }
        const instructorName = `${instructorResult.rows[0].ins_fname} ${instructorResult.rows[0].ins_lname}`;

        const existingFaceResult = await dbClient.query(
            `SELECT luxand_subject_id FROM instructor_face
             WHERE ins_id = $1 AND luxand_subject_id IS NOT NULL AND is_active = true
             ORDER BY date_created DESC LIMIT 1`,
            [ins_id]
        );

        const existingSubjectId = existingFaceResult.rows.length > 0
            ? existingFaceResult.rows[0].luxand_subject_id
            : null;

        // === STEP 2: Prepare Image and Call Luxand API ===
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const formData = new FormData();
        formData.append('photos', imageBuffer, { filename: 'registration_photo.jpg' });

        let luxandResponse;

        if (existingSubjectId) {
            // --- This person exists in Luxand. Add a new face to them. ---
            console.log(`[Luxand] Adding new face to existing subject: ${existingSubjectId}`);
            formData.append('store', '1'); // Store the photo
            luxandResponse = await axios.post(
                `https://api.luxand.cloud/v2/person/${existingSubjectId}`,
                formData,
                { headers: { ...formData.getHeaders(), 'token': LUXAND_API_KEY } }
            );
        } else {
            // --- This is a new person. Create them in Luxand. ---
            console.log(`[Luxand] Creating new subject for instructor: ${ins_id}`);
            formData.append('name', instructorName);
            // --- ADD store=1 to save the image ---
            formData.append('store', '1');
            luxandResponse = await axios.post(
                'https://api.luxand.cloud/v2/person',
                formData,
                { headers: { ...formData.getHeaders(), 'token': LUXAND_API_KEY } }
            );
        }

        const luxandData = luxandResponse.data;
        if (luxandData.status !== 'success' && luxandData.status !== 'updated') {
            throw new Error(luxandData.message || 'Luxand API error');
        }

        // === STEP 3: Deactivate Old Faces and Save New Face to DB ===
        await dbClient.query(
            'UPDATE instructor_face SET is_active = false WHERE ins_id = $1',
            [ins_id]
        );

        // --- *** START OF CHANGES *** ---

        // 1. Get the URL and UUID from the Luxand response
        let newFaceUuid, newFaceUrl, newSubjectId;

        newSubjectId = luxandData.id; // This is the person/subject ID

        if (existingSubjectId) {
            // Response format for adding a face
            newFaceUuid = luxandData.uuid; // The face's unique ID
            newFaceUrl = luxandData.url;   // The public URL of the image
        } else {
            // Response format for creating a new person
            newFaceUuid = luxandData.faces[0].uuid; // Get UUID from the first face
            newFaceUrl = luxandData.faces[0].url;  // Get URL from the first face
        }

        const createdBy = 'System Admin';

        // 2. Save the newFaceUrl into your database (it was 'null' before)
        const dbInsertResult = await dbClient.query(
            'SELECT * FROM instructor_face_create($1, $2, $3, $4, $5)',
            [ins_id, newFaceUuid, newFaceUrl, newSubjectId, createdBy]
        );

        // --- *** END OF CHANGES *** ---

        // === STEP 4: Send Success Response ===
        res.status(201).json({
            message: `Successfully registered face for ${instructorName}.`,
            luxand_response: luxandData,
            database_record: dbInsertResult.rows[0],
        });

    } catch (error) {
        console.error('Error in /instructor-faces/register:', error.response ? error.response.data : error.message);
        next(error);
    } finally {
        if (dbClient) dbClient.release();
    }
});

/**
 * @route   GET /instructor-faces/instructor/:instructorId
 * @desc    Get all active faces for a specific instructor.
 * @access  Public
 */
router.get('/instructor/:instructorId', async (req, res, next) => {
    const { instructorId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM instructor_face WHERE ins_id = $1 AND is_active = true',
            [instructorId]
        );
        res.json({ faces: result.rows });
    } catch (error) {
        console.error('Error in getInstructorFaces:', error.message);
        next(error);
    }
});

/**
 * @route   GET /instructor-faces/face/:faceUuid
 * @desc    Get instructor details from a recognized face UUID.
 * @access  Public
 */
router.get('/face/:faceUuid', async (req, res, next) => {
    // (This route is unchanged)
    const { faceUuid } = req.params;
    try {
        const query = `
            SELECT i.*, f.luxand_subject_id
            FROM instructor i
                     JOIN instructor_face f ON i.ins_id = f.ins_id
            WHERE f.face_uuid = $1 AND f.is_active = true;
        `;
        const result = await pool.query(query, [faceUuid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No active instructor found for that face UUID.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error in getInstructorByFaceUuid:', error.message);
        next(error);
    }
});

/**
 * @route   DELETE /instructor-faces/:id
 * @desc    Deactivate a face (soft delete) from DB and Luxand.
 * @access  Public (or add auth)
 */
router.delete('/:id', async (req, res, next) => {
    // (This route is unchanged)
    const { id } = req.params;
    const dbClient = await pool.connect();

    try {
        const faceResult = await dbClient.query(
            'SELECT face_uuid, luxand_subject_id FROM instructor_face WHERE face_id = $1',
            [id]
        );
        if (faceResult.rows.length === 0) {
            return res.status(404).json({ message: 'Face not found.' });
        }

        const { face_uuid, luxand_subject_id } = faceResult.rows[0];

        if (face_uuid && luxand_subject_id) {
            try {
                await axios.delete(
                    `https://api.luxand.cloud/v2/person/${luxand_subject_id}/${face_uuid}`,
                    { headers: { 'token': LUXAND_API_KEY } }
                );
                console.log(`[Luxand] Deleted face ${face_uuid} from subject ${luxand_subject_id}`);
            } catch (luxandError) {
                if (luxandError.response?.status !== 404) throw luxandError;
                console.warn(`[Luxand] Face ${face_uuid} not found. Proceeding with DB deactivation.`);
            }
        }

        await dbClient.query('SELECT * FROM instructor_face_deactivate($1)', [id]);
        res.status(200).json({ message: 'Face deactivated and removed from Luxand.' });

    } catch (error) {
        console.error('Error in deleteInstructorFace:', error.message);
        next(error);
    } finally {
        if (dbClient) dbClient.release();
    }
});

/**
 * @route   POST /instructor-faces/recognize
 * @desc    Recognize a face from an image.
 * @access  Public
 * @body    { imageBase64: string }
 */
router.post('/recognize', async (req, res, next) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
        return res.status(400).json({ message: 'imageBase64 is required.' });
    }

    try {
        // 1. Clean the Base64 string
        // This regex handles both "data:image/jpeg;base64," and raw strings
        const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // 2. Build Form Data
        const formData = new FormData();

        // --- *** FIX 1: Change 'photos' to 'photo' (Singular) *** ---
        // --- *** FIX 2: Add contentType explicitly *** ---
        formData.append('photo', imageBuffer, {
            filename: 'recognition_photo.jpg',
            contentType: 'image/jpeg'
        });

        console.log("Sending request to Luxand /photo/search...");

        // 3. Call Luxand Search Endpoint
        const luxandResponse = await axios.post(
            'https://api.luxand.cloud/photo/search',
            formData,
            { headers: { ...formData.getHeaders(), 'token': LUXAND_API_KEY } }
        );

        const matches = luxandResponse.data;
        console.log("Luxand Response:", JSON.stringify(matches, null, 2));

        // 4. Validate Response is an Array
        if (!Array.isArray(matches)) {
            // If Luxand returns { status: "failure" }, handle it here
            if (matches.status === 'failure') {
                return res.status(400).json({ message: `Face API Error: ${matches.message}` });
            }
            return res.status(404).json({ message: 'No face detected in the image.' });
        }

        // 5. Check if matches found
        if (matches.length === 0) {
            return res.status(404).json({ message: 'Face detected, but not recognized in our database.' });
        }

        // 6. Get the best match
        const bestMatch = matches[0];
        const faceUuid = bestMatch.uuid;

        if (!faceUuid) {
            return res.status(500).json({ message: 'Invalid response structure from facial recognition provider.' });
        }

        // 7. Look up in database
        const query = `
      SELECT i.*, f.luxand_subject_id 
      FROM instructor i
      JOIN instructor_face f ON i.ins_id = f.ins_id
      WHERE f.face_uuid = $1 AND f.is_active = true;
    `;
        const dbResult = await pool.query(query, [faceUuid]);

        if (dbResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Face recognized by AI, but the instructor record is not linked in your local database.'
            });
        }

        // Success!
        res.json({
            message: 'Face recognized successfully.',
            instructor: dbResult.rows[0],
            luxand_match: bestMatch
        });

    } catch (error) {
        console.error('Error in recognizeFace:', error.response ? error.response.data : error.message);

        // Handle specific Luxand "No face found" errors which might come as 400 or 500
        if (error.response && error.response.data && error.response.data.message) {
            return res.status(400).json({ message: `Recognition failed: ${error.response.data.message}` });
        }

        next(error);
    }
});


// --- *** NEW ROUTE ADDED HERE *** ---
/**
 * @route   GET /instructor-faces/all-faces
 * @desc    Get all active faces from the database.
 * @access  Public
 */
router.get('/all-faces', async (req, res, next) => {
    try {
        const result = await pool.query(
            'SELECT * FROM instructor_face WHERE is_active = true'
        );
        // Return in the same format as your other routes
        res.json({ faces: result.rows });
    } catch (error)
    {
        console.error('Error in /all-faces:', error.message);
        next(error);
    }
});

export default router;