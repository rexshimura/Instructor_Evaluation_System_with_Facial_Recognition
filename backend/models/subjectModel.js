import pool from '../server/db/pool.js';

export const createSubject = async (payload) => {
  // FIXED: Use direct INSERT query instead of non-existent function
  const { rows } = await pool.query(
    `INSERT INTO subject_table (sub_name, sub_semester, sub_year, sub_course, sub_units)
     VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
    [payload.sub_name, payload.sub_semester, payload.sub_year, payload.sub_course, payload.sub_units]
  );
  return rows[0];
};

export const getSubjectById = async (id) => {
  // FIXED: Use direct query instead of non-existent function
  const { rows } = await pool.query('SELECT * FROM subject_table WHERE sub_id = $1;', [id]);
  return rows[0];
};

export const getAllSubjects = async () => {
  const { rows } = await pool.query('SELECT * FROM subject_table ORDER BY sub_id ASC;');
  return rows;
};

export const updateSubject = async (id, payload) => {
  // FIXED: Use direct UPDATE query instead of non-existent function
  const { rows } = await pool.query(
    `UPDATE subject_table SET
     sub_name = COALESCE($1, sub_name),
     sub_semester = COALESCE($2, sub_semester),
     sub_year = COALESCE($3, sub_year),
     sub_course = COALESCE($4, sub_course),
     sub_units = COALESCE($5, sub_units)
     WHERE sub_id = $6
     RETURNING *;`,
    [
      payload.sub_name || null,
      payload.sub_semester || null,
      payload.sub_year || null,
      payload.sub_course || null,
      payload.sub_units || null,
      id
    ]
  );
  return rows[0];
};

export const deleteSubject = async (id) => {
  // FIXED: Use direct DELETE query instead of non-existent function
  await pool.query('DELETE FROM subject_table WHERE sub_id = $1;', [id]);
};