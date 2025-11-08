import pool from '../db/pool.js';

export const createSubject = async (payload) => {
  const { rows } = await pool.query(
    'SELECT * FROM subject_create($1,$2,$3,$4,$5);',
    [payload.sub_name, payload.sub_semester, payload.sub_year, payload.sub_course, payload.sub_units]
  );
  return rows[0];
};

export const getSubjectById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM subject_read($1);', [id]);
  return rows[0];
};

export const getAllSubjects = async () => {
  const { rows } = await pool.query('SELECT * FROM subject_table ORDER BY sub_id ASC;');
  return rows;
};

export const updateSubject = async (id, payload) => {
  const { rows } = await pool.query(
    'SELECT * FROM subject_update($1,$2,$3,$4,$5,$6);', 
    [
      id, 
      payload.sub_name || null, 
      payload.sub_semester || null, 
      payload.sub_year || null, 
      payload.sub_course || null, 
      payload.sub_units || null
    ]
  );
  return rows[0];
};

export const deleteSubject = async (id) => {
  await pool.query('SELECT subject_delete($1);', [id]);
};