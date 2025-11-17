import 'dotenv/config';
import express from 'express';
// Note: Removed 'multer' and 'fs' imports, as they are no longer needed
// if the old /register-face endpoint is also removed.
import pool from '../server/db/pool.js';
import { rekClient, COLLECTION_ID } from '../rekognitionClient.js';
import {
    IndexFacesCommand,
    CreateFaceLivenessSessionCommand,
    GetFaceLivenessSessionResultsCommand,
    SearchFacesByImageCommand,
    DeleteFacesCommand,
} from '@aws-sdk/client-rekognition';

const router = express.Router();
// const upload = multer({ dest: 'uploads/' }); // Removed

/**
 * Endpoint 1 (NEW): Register Face via Liveness Check
 * Action: Executes Liveness check, extracts the reference image, indexes face, and saves to PostgreSQL.
 */
router.post('/register-face-liveness', async (req, res) => {
    const { sessionId, ins_id, created_by } = req.body;

    console.log("🔍 [REGISTER-FACE] Starting registration process...");
    console.log("📦 Request body:", { sessionId, ins_id, created_by });

    if (!sessionId || !ins_id || !created_by) {
        return res.status(400).json({ error: 'Missing sessionId, ins_id, or created_by' });
    }

    try {
        // --- Step 1: Get Liveness Results ---
        console.log("📋 Step 1: Getting liveness results for session:", sessionId);

        const livenessCommand = new GetFaceLivenessSessionResultsCommand({ SessionId: sessionId });
        const livenessResponse = await rekClient.send(livenessCommand);

        console.log("📊 Liveness Response Summary:", {
            Status: livenessResponse.Status,
            Confidence: livenessResponse.Confidence,
            HasReferenceImage: !!livenessResponse.ReferenceImage,
            ImageBytesLength: livenessResponse.ReferenceImage?.Bytes?.length
        });

        // ✅ FIX: Check for 'SUCCEEDED' instead of 'SUCCESS'
        if (livenessResponse.Status !== 'SUCCEEDED') {
            console.error("❌ Liveness failed with status:", livenessResponse.Status);
            return res.status(400).json({
                error: `Liveness check failed with status: ${livenessResponse.Status}`,
                status: livenessResponse.Status,
                confidence: livenessResponse.Confidence
            });
        }

        // Check confidence (optional, but good practice)
        if (!livenessResponse.Confidence || livenessResponse.Confidence < 80) {
            console.error("❌ Liveness confidence too low:", livenessResponse.Confidence);
            return res.status(400).json({
                error: `Liveness confidence too low: ${livenessResponse.Confidence}. Minimum 80% required.`,
                confidence: livenessResponse.Confidence
            });
        }

        const imageBytes = livenessResponse.ReferenceImage?.Bytes;
        if (!imageBytes) {
            console.error("❌ No reference image bytes available");
            return res.status(400).json({
                error: 'Liveness session did not provide a valid reference image.',
                details: 'Reference image bytes are missing'
            });
        }

        console.log("✅ Liveness check passed. Image bytes length:", imageBytes.length);

        // --- Step 2: Index Face ---
        console.log("📸 Step 2: Indexing face in collection:", COLLECTION_ID);

        const indexFacesCommand = new IndexFacesCommand({
            CollectionId: COLLECTION_ID,
            Image: { Bytes: imageBytes },
            ExternalImageId: ins_id,
            MaxFaces: 1,
            QualityFilter: 'AUTO',
        });

        const indexFacesResponse = await rekClient.send(indexFacesCommand);

        console.log("📋 Index Faces Response Summary:", {
            faceRecordsCount: indexFacesResponse.FaceRecords?.length,
            unindexedFacesCount: indexFacesResponse.UnindexedFaces?.length
        });

        if (indexFacesResponse.FaceRecords && indexFacesResponse.FaceRecords.length > 0) {
            const awsFaceId = indexFacesResponse.FaceRecords[0].Face.FaceId;
            console.log("✅ Face indexed successfully. AWS Face ID:", awsFaceId);

            // --- Step 3: Save to Database ---
            console.log("💾 Step 3: Saving to database...");

            try {
                const dbResult = await pool.query(
                    "SELECT * FROM instructor_face_create($1, $2, $3)",
                    [ins_id, awsFaceId, created_by]
                );

                console.log("💾 Database record created successfully");

                res.status(201).json({
                    message: 'Face registered successfully via Liveness check',
                    awsFaceId: awsFaceId,
                    dbRecord: dbResult.rows[0],
                    livenessConfidence: livenessResponse.Confidence
                });

            } catch (dbError) {
                console.error("❌ Database error:", dbError);

                // Rollback: Delete the face from AWS if DB fails
                try {
                    await rekClient.send(new DeleteFacesCommand({
                        CollectionId: COLLECTION_ID,
                        FaceIds: [awsFaceId],
                    }));
                    console.log("✅ Rollback: Deleted face from AWS due to DB failure");
                } catch (rollbackError) {
                    console.error("❌ Rollback failed:", rollbackError);
                }

                res.status(500).json({
                    error: 'Database error during face registration',
                    details: dbError.message
                });
            }

        } else {
            console.error("❌ No face detected in reference image");
            res.status(400).json({
                error: 'No face detected in the Liveness reference image.',
                details: indexFacesResponse.UnindexedFaces
            });
        }

    } catch (err) {
        console.error('❌ Liveness Registration Error:', err);
        res.status(500).json({
            error: 'Server error during Liveness registration',
            details: err.message
        });
    }
});

// Add this temporary route for testing
router.get('/test-collection', async (req, res) => {
    try {
        const { DescribeCollectionCommand } = await import('@aws-sdk/client-rekognition');
        const command = new DescribeCollectionCommand({
            CollectionId: COLLECTION_ID
        });
        const result = await rekClient.send(command);
        res.json({
            message: 'Collection exists',
            collection: result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Collection test failed',
            details: error.message
        });
    }
});
/**
 * Endpoint 2: Create a Liveness Session for Verification
 * Action: Initiates the liveness process with AWS and returns a sessionId.
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
 * Action: Checks liveness, searches the collection, and retrieves the instructor record.
 */
router.post('/get-verification-result', async (req, res) => {
    const { sessionId, instructorID } = req.body;
    console.log(`🔍 Getting verification results for session: ${sessionId}. Claimed ID: ${instructorID}`);

    if (!sessionId || !instructorID) {
        return res.status(400).json({
            isMatch: false,
            error: 'Missing sessionId or instructorID'
        });
    }

    try {
        // --- Step 1: Get Liveness Results ---
        const livenessCommand = new GetFaceLivenessSessionResultsCommand({
            SessionId: sessionId
        });
        const livenessResponse = await rekClient.send(livenessCommand);

        console.log("📊 Liveness response:", {
            status: livenessResponse.Status,
            confidence: livenessResponse.Confidence
        });

        // ✅ FIX: Check for 'SUCCEEDED' (not 'SUCCESS')
        if (livenessResponse.Status !== 'SUCCEEDED') {
            console.error("❌ Liveness failed with status:", livenessResponse.Status);
            return res.status(400).json({
                isMatch: false,
                error: `Liveness check failed with status: ${livenessResponse.Status}`
            });
        }

        // Check confidence score
        if (!livenessResponse.Confidence || livenessResponse.Confidence < 80) {
            console.error("❌ Liveness confidence too low:", livenessResponse.Confidence);
            return res.status(400).json({
                isMatch: false,
                error: `Liveness confidence too low: ${livenessResponse.Confidence}%`
            });
        }

        if (!livenessResponse.ReferenceImage || !livenessResponse.ReferenceImage.Bytes) {
            console.error("❌ No reference image available");
            return res.status(400).json({
                isMatch: false,
                error: 'No reference image available from liveness session'
            });
        }

        console.log("✅ Liveness check passed. Confidence:", livenessResponse.Confidence);

        // --- Step 2: Face Search (Matching) ---
        const searchCommand = new SearchFacesByImageCommand({
            CollectionId: COLLECTION_ID,
            Image: { Bytes: livenessResponse.ReferenceImage.Bytes },
            MaxFaces: 1,
            FaceMatchThreshold: 75,
            QualityFilter: 'AUTO'
        });

        const searchResponse = await rekClient.send(searchCommand);
        console.log("🔎 Face search results:", {
            matches: searchResponse.FaceMatches?.length,
            similarity: searchResponse.FaceMatches?.[0]?.Similarity,
            externalImageId: searchResponse.FaceMatches?.[0]?.Face?.ExternalImageId
        });

        if (searchResponse.FaceMatches && searchResponse.FaceMatches.length > 0) {
            const match = searchResponse.FaceMatches[0];
            const matched_ins_id = match.Face.ExternalImageId;

            console.log(`🔍 Face matched with ID: ${matched_ins_id}, user claimed: ${instructorID}`);

            // Validate the ID found by AWS matches the ID provided by the user
            if (matched_ins_id !== instructorID) {
                console.warn(`⚠️ Security Alert: Face matched ID ${matched_ins_id}, but user claimed ID ${instructorID}`);
                return res.status(401).json({
                    isMatch: false,
                    error: `Identity mismatch. Face belongs to a different instructor.`
                });
            }

            // --- Step 3: Database Lookup ---
            const instructorResult = await pool.query(
                "SELECT ins_id, ins_fname, ins_mname, ins_lname, ins_email, ins_dept FROM instructor WHERE ins_id = $1",
                [matched_ins_id]
            );

            if (instructorResult.rows.length === 0) {
                return res.status(404).json({
                    isMatch: false,
                    error: 'Face matched but instructor not found in database'
                });
            }

            // --- SUCCESS ---
            console.log("✅ User Verified in DB:", instructorResult.rows[0]);

            res.json({
                isMatch: true,
                instructor: instructorResult.rows[0],
                confidence: match.Similarity,
                livenessConfidence: livenessResponse.Confidence
            });

        } else {
            // Face not recognized in AWS
            console.log("❌ No face matches found in collection");
            res.status(400).json({
                isMatch: false,
                error: 'Face not recognized in our system. Please register first.'
            });
        }

    } catch (err) {
        console.error('❌ Verification Error:', err);

        // More specific error handling
        if (err.name === 'InvalidParameterException') {
            res.status(400).json({
                isMatch: false,
                error: 'Invalid session or parameters',
                details: err.message
            });
        } else if (err.name === 'ResourceNotFoundException') {
            res.status(404).json({
                isMatch: false,
                error: 'Liveness session not found or expired',
                details: err.message
            });
        } else {
            res.status(500).json({
                isMatch: false,
                error: 'Server error during verification',
                details: err.message
            });
        }
    }
});

// Add this temporary route to test the collection and face matching
router.get('/test-face-match/:instructorID', async (req, res) => {
    const { instructorID } = req.params;

    try {
        console.log(`🔍 Testing face match for instructor: ${instructorID}`);

        // List faces in collection to see if the instructor's face exists
        const { ListFacesCommand } = await import('@aws-sdk/client-rekognition');
        const listCommand = new ListFacesCommand({
            CollectionId: COLLECTION_ID,
            MaxResults: 1000
        });

        const facesResponse = await rekClient.send(listCommand);
        const instructorFace = facesResponse.Faces?.find(face => face.ExternalImageId === instructorID);

        console.log("📋 Faces in collection:", {
            totalFaces: facesResponse.Faces?.length,
            instructorFace: instructorFace ? {
                faceId: instructorFace.FaceId,
                externalImageId: instructorFace.ExternalImageId,
                confidence: instructorFace.Confidence
            } : 'NOT FOUND'
        });

        res.json({
            instructorID,
            totalFacesInCollection: facesResponse.Faces?.length,
            faceFound: !!instructorFace,
            faceDetails: instructorFace
        });

    } catch (error) {
        console.error('❌ Test face match error:', error);
        res.status(500).json({
            error: 'Test failed',
            details: error.message
        });
    }
});

/**
 * Endpoint 4: Delete an Instructor's Face
 */
router.delete('/delete-face/:insId', async (req, res) => {
    const { insId } = req.params;

    try {
        // 1. Look up the AWS Face ID from your database
        const dbFaceResult = await pool.query(
            "SELECT face_id, aws_face_id FROM instructor_face WHERE ins_id = $1 AND is_active = true",
            [insId]
        );

        if (dbFaceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Instructor face record not found in database.' });
        }

        const awsFaceIdToDelete = dbFaceResult.rows[0].aws_face_id;

        // 2. Delete the face from the AWS Rekognition Collection
        const deleteCommand = new DeleteFacesCommand({
            CollectionId: COLLECTION_ID,
            FaceIds: [awsFaceIdToDelete],
        });
        const deleteResponse = await rekClient.send(deleteCommand);

        if (deleteResponse.DeletedFaces.length === 0) {
            console.warn(`AWS Delete failed for FaceId: ${awsFaceIdToDelete}. Possibly already deleted.`);
        }

        // 3. Mark the face record as inactive in PostgreSQL
        await pool.query(
            "SELECT instructor_face_deactivate($1)",
            [dbFaceResult.rows[0].face_id]
        );

        res.json({
            message: `Face for Instructor ${insId} successfully deleted from AWS and deactivated in DB.`,
            deletedAwsFaceId: awsFaceIdToDelete,
        });

    } catch (err) {
        console.error('❌ Delete Face Error:', err);
        res.status(500).json({
            error: 'Server error during face deletion',
            details: err.message
        });
    }
});

export default router;