// models/sectionModel.js
import pool from '../db/pool.js';

export const createSection = async (payload) => {
  const { rows } = await pool.query(
    'SELECT * FROM section_create($1,$2,$3,$4,$5);',  // ✅ 5 parameters
    [
      payload.sect_semester,
      payload.sect_name,
      payload.sect_year_level,
      payload.sect_school_year,
      payload.sect_course
    ]
  );
  return rows[0];
};

export const getSectionById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM section_table WHERE section_id = $1;', [id]);  // CHANGED TO DIRECT QUERY
  return rows[0];
};

export const getAllSections = async () => {
  const { rows } = await pool.query('SELECT * FROM section_table ORDER BY section_id ASC;');
  return rows;
};

export const updateSection = async (id, payload) => {
  const { rows } = await pool.query(
    'UPDATE section_table SET sect_name = $1 WHERE section_id = $2 RETURNING *;',  // CHANGED TO DIRECT QUERY
    [payload.sect_name || null, id]
  );
  return rows[0];
};

export const deleteSection = async (id) => {
  await pool.query('DELETE FROM section_table WHERE section_id = $1;', [id]);  // CHANGED TO DIRECT QUERY
};