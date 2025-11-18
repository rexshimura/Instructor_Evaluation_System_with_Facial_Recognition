// models/instructorFaceModel.js
import pool from '../server/db/pool.js';

export const createInstructorFace = async (payload) => {
  // FIXED: Use direct INSERT query instead of non-existent function
  const { rows } = await pool.query(
    `INSERT INTO instructor_face (ins_id, aws_face_id, face_image_url, created_by)
     VALUES ($1, $2, $3, $4) RETURNING *;`,
    [payload.ins_id, payload.face_uuid, payload.face_image_url, payload.created_by]
  );
  return rows[0];
};

export const getFacesByInstructor = async (insId) => {
  // FIXED: Use direct query instead of non-existent function
  const { rows } = await pool.query(
    'SELECT * FROM instructor_face WHERE ins_id = $1 AND is_active = true;',
    [insId]
  );
  return rows;
};

export const getFaceByUuid = async (faceUuid) => {
  // FIXED: Use direct query instead of non-existent function
  const { rows } = await pool.query(
    'SELECT * FROM instructor_face WHERE aws_face_id = $1 AND is_active = true;',
    [faceUuid]
  );
  return rows[0];
};

export const deleteFace = async (faceId) => {
  // FIXED: Use direct DELETE query instead of non-existent function
  await pool.query('UPDATE instructor_face SET is_active = false WHERE face_id = $1;', [faceId]);
};