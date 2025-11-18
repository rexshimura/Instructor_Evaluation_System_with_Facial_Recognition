import pool from '../server/db/pool.js';

// Student CRUD functions
export const createStudent = async (payload) => {
  // FIXED: Use direct INSERT query instead of non-existent function
  const q = `
    INSERT INTO student (
      stud_fname, stud_mname, stud_lname, stud_suffix, stud_dob,
      stud_sex, stud_course, stud_year, stud_section, stud_semester
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
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
  // FIXED: Use direct query instead of non-existent function
  const { rows } = await pool.query('SELECT * FROM student WHERE stud_id = $1;', [studId]);
  return rows[0];
};

export const getAllStudents = async () => {
  const { rows } = await pool.query('SELECT * FROM student ORDER BY stud_id DESC;');
  return rows;
};

export const updateStudent = async (studId, payload) => {
  // FIXED: Use direct UPDATE query instead of non-existent function
  const { rows } = await pool.query(
    `UPDATE student SET
     stud_fname = COALESCE($1, stud_fname),
     stud_mname = COALESCE($2, stud_mname),
     stud_lname = COALESCE($3, stud_lname),
     stud_suffix = COALESCE($4, stud_suffix),
     stud_dob = COALESCE($5, stud_dob),
     stud_sex = COALESCE($6, stud_sex),
     stud_course = COALESCE($7, stud_course),
     stud_year = COALESCE($8, stud_year),
     stud_section = COALESCE($9, stud_section),
     stud_semester = COALESCE($10, stud_semester)
     WHERE stud_id = $11
     RETURNING *;`,
    [payload.stud_fname || null, payload.stud_mname || null, payload.stud_lname || null, payload.stud_suffix || null, payload.stud_dob || null, payload.stud_sex || null, payload.stud_course || null, payload.stud_year || null, payload.stud_section || null, payload.stud_semester || null, studId]
  );
  return rows[0];
};

export const deleteStudent = async (studId) => {
  // FIXED: Use direct DELETE query instead of non-existent function
  await pool.query('DELETE FROM student WHERE stud_id = $1;', [studId]);
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