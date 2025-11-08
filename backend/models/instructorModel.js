import pool from '../db/pool.js';

export const createInstructor = async (payload) => {
  const q = `
    SELECT * FROM instructor_create($1,$2,$3,$4,$5,$6,$7,$8,$9);
  `;
  const vals = [
    payload.ins_fname,
    payload.ins_mname,
    payload.ins_lname,
    payload.ins_suffix || null,
    payload.ins_dob,
    payload.ins_sex,
    payload.ins_email,
    payload.ins_contact,
    payload.ins_dept
  ];
  const { rows } = await pool.query(q, vals);
  return rows[0];
};

export const getInstructorById = async (insId) => {
  // FIXED: Use direct query instead of non-existent function
  const { rows } = await pool.query('SELECT * FROM instructor WHERE ins_id = $1;', [insId]);
  return rows[0];
};

export const getAllInstructors = async () => {
  const { rows } = await pool.query('SELECT * FROM instructor ORDER BY ins_id DESC;');
  return rows;
};

export const updateInstructor = async (insId, payload) => {
  // FIXED: Use direct query instead of non-existent function
  const { rows } = await pool.query(
    'UPDATE instructor SET ins_email = COALESCE($1, ins_email), ins_contact = COALESCE($2, ins_contact) WHERE ins_id = $3 RETURNING *;',
    [payload.ins_email || null, payload.ins_contact || null, insId]
  );
  return rows[0];
};

export const deleteInstructor = async (insId) => {
  // FIXED: Use direct query instead of non-existent function
  await pool.query('DELETE FROM instructor WHERE ins_id = $1;', [insId]);
};