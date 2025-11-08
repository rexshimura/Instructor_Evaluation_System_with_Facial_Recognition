// backend/server/controllers/instructorFaceController.js
import pool from '../db/pool.js'; 
import * as InstructorFace from '../models/instructorFaceModel.js';

export const registerInstructorFace = async (req, res) => {
  try {
    const { ins_id, face_uuid, created_by } = req.body;
    
    if (!ins_id || !face_uuid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Instructor ID and face UUID are required' 
      });
    }

    const faceRecord = await InstructorFace.createInstructorFace({
      ins_id,
      face_uuid,
      face_image_url: null,
      created_by: created_by || 'system'
    });

    res.status(201).json({
      success: true,
      message: 'Face registered successfully',
      faceRecord
    });
  } catch (error) {
    console.error('Error registering instructor face:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register face'
    });
  }
};

export const getInstructorFaces = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const faces = await InstructorFace.getFacesByInstructor(instructorId);
    
    res.json({
      success: true,
      faces
    });
  } catch (error) {
    console.error('Error fetching instructor faces:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faces'
    });
  }
};

export const deleteInstructorFace = async (req, res) => {
  try {
    const { id } = req.params;
    await InstructorFace.deleteFace(id);
    
    res.json({
      success: true,
      message: 'Face record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting instructor face:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete face record'
    });
  }
};

// ADD THIS NEW FUNCTION TO FIX THE ERROR
export const getInstructorByFaceUuid = async (req, res) => {
  try {
    const { faceUuid } = req.params;

    if (!faceUuid) {
      return res.status(400).json({
        success: false,
        message: 'Face UUID is required'
      });
    }

    // Query to get instructor by face UUID
    const query = `
      SELECT i.* 
      FROM instructor i
      INNER JOIN instructor_face if ON i.ins_id = if.ins_id
      WHERE if.face_uuid = $1
    `;

    const result = await pool.query(query, [faceUuid]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No instructor found for the given face UUID'
      });
    }

    res.json({
      success: true,
      instructor: result.rows[0]
    });

  } catch (error) {
    console.error('Error finding instructor by face UUID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};