// models/instructorFaceModel.js
import pool from '../db/pool.js';

export const createInstructorFace = async (payload) => {
  const { rows } = await pool.query(
    'SELECT * FROM instructor_face_create($1, $2, $3, $4)',
    [payload.ins_id, payload.face_uuid, payload.face_image_url, payload.created_by]
  );
  return rows[0];
};

export const getFacesByInstructor = async (insId) => {
  const { rows } = await pool.query(
    'SELECT * FROM instructor_face_read_by_instructor($1)',
    [insId]
  );
  return rows;
};

export const getFaceByUuid = async (faceUuid) => {
  const { rows } = await pool.query(
    'SELECT * FROM instructor_face_read_by_uuid($1)',
    [faceUuid]
  );
  return rows[0];
};

export const deleteFace = async (faceId) => {
  await pool.query('SELECT instructor_face_delete($1)', [faceId]);
};