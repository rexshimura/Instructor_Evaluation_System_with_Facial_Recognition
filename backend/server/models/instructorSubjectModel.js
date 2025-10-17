import pool from "../db/pool.js";

// Get all instructor-subject pairs
export const getAllInstructorSubjects = async () => {
  const result = await pool.query(`
    SELECT 
      isub.insub_id,
      i.ins_id,
      i.ins_fname,
      i.ins_lname,
      s.sub_id,
      s.sub_name
    FROM instructor_subject AS isub
    JOIN instructor AS i ON isub.ins_id = i.ins_id
    JOIN subject_table AS s ON isub.sub_id = s.sub_id
    ORDER BY isub.insub_id ASC
  `);
  return result.rows;
};

// Create a new instructor-subject pair
export const createInstructorSubject = async (ins_id, sub_id) => {
  const existing = await pool.query(
    "SELECT * FROM instructor_subject WHERE ins_id = $1 AND sub_id = $2",
    [ins_id, sub_id]
  );

  if (existing.rows.length > 0) {
    throw new Error("This instructor-subject pair already exists");
  }

  const result = await pool.query(
    `INSERT INTO instructor_subject (ins_id, sub_id)
     VALUES ($1, $2)
     RETURNING *`,
    [ins_id, sub_id]
  );

  return result.rows[0];
};

// Delete instructor-subject pair
export const deleteInstructorSubject = async (id) => {
  const result = await pool.query(
    "DELETE FROM instructor_subject WHERE insub_id = $1 RETURNING *",
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Instructor-subject link not found");
  }

  return result.rows[0];
};
