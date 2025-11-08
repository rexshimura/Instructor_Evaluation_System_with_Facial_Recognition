import pool from '../db/pool.js';

// Student CRUD functions
export const createStudent = async (payload) => {
  const q = `
    SELECT * FROM student_create($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);
  `;
  const vals = [
    payload.stud_fname,
    payload.stud_mname,
    payload.stud_lname,
    payload.stud_suffix || null,
    payload.stud_dob,
    payload.stud_sex,
    payload.stud_course,
    payload.stud_year,
    payload.stud_section,
    payload.stud_semester
  ];
  const { rows } = await pool.query(q, vals);
  return rows[0];
};

export const getStudentById = async (studId) => {
  try {
    console.log('Getting student by ID:', studId);
    // Try stored procedure first
    const { rows } = await pool.query('SELECT * FROM student_read($1);', [studId]);
    return rows[0];
  } catch (error) {
    console.log('Stored procedure failed, trying direct query...');
    // Fallback to direct query
    const { rows } = await pool.query('SELECT * FROM student WHERE stud_id = $1;', [studId]);
    return rows[0];
  }
};

export const getAllStudents = async () => {
  const { rows } = await pool.query('SELECT * FROM student ORDER BY stud_id DESC;');
  return rows;
};

export const updateStudent = async (studId, payload) => {
  const { rows } = await pool.query(
    'SELECT * FROM student_update($1,$2,$3,$4);',
    [studId, payload.stud_fname || null, payload.stud_mname || null, payload.stud_lname || null]
  );
  return rows[0];
};

export const deleteStudent = async (studId) => {
  await pool.query('SELECT student_delete($1);', [studId]);
};

// Alternative function for login
export const findStudentById = async (studId) => {
  try {
    const { rows } = await pool.query('SELECT * FROM student WHERE stud_id = $1;', [studId]);
    return rows[0];
  } catch (error) {
    console.error('Error in findStudentById:', error);
    throw error;
  }
};