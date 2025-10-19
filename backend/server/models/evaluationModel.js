// models/evaluationModel.js - UPDATED VERSION
import pool from '../db/pool.js';

export const createEvaluation = async (payload) => {
  console.log("Received evaluation payload:", payload);
  
  // First get the subject name
  const subjectResult = await pool.query(
    'SELECT sub_name FROM subject_table WHERE sub_id = $1', 
    [payload.sub_id]
  );
  
  if (subjectResult.rows.length === 0) {
    throw new Error('Subject not found');
  }
  
  const subjectName = subjectResult.rows[0].sub_name;
  const totalRating = (payload.ev_C1 + payload.ev_C2 + payload.ev_C3 + payload.ev_C4 + payload.ev_C5) / 5;
  
  console.log("Subject name:", subjectName);
  console.log("Total rating:", totalRating);
  console.log("Remarks to be saved:", payload.ev_remark);
  
  const q = `
    INSERT INTO evaluation (
      ev_subject, 
      ev_semester, 
      ev_C1, 
      ev_C2, 
      ev_C3, 
      ev_C4, 
      ev_C5, 
      ev_total_rating, 
      ev_remark, 
      sub_id, 
      stud_id, 
      ins_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;
  
  const { rows } = await pool.query(q, [
    subjectName,
    payload.ev_semester,
    payload.ev_C1,
    payload.ev_C2,
    payload.ev_C3,
    payload.ev_C4,
    payload.ev_C5,
    parseFloat(totalRating.toFixed(3)),
    payload.ev_remark || '',
    payload.sub_id,
    payload.stud_id,
    payload.ins_id
  ]);
  
  console.log("Saved evaluation:", rows[0]);
  return rows[0];
};

export const getEvaluationById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM evaluation WHERE ev_id = $1;', [id]);
  return rows[0];
};

export const getAllEvaluations = async () => {
  const q = `
    SELECT 
      e.*, 
      s.sub_name AS subject_name, 
      s.sub_miscode, 
      s.sub_course,
      st.stud_fname, 
      st.stud_lname, 
      st.stud_course AS student_course,
      i.ins_fname, 
      i.ins_lname,
      i.ins_dept
    FROM evaluation e
    LEFT JOIN subject_table s ON e.sub_id = s.sub_id
    LEFT JOIN student st ON e.stud_id = st.stud_id
    LEFT JOIN instructor i ON e.ins_id = i.ins_id
    ORDER BY e.ev_id DESC;
  `;
  const { rows } = await pool.query(q);
  return rows;
};

export const getEvaluationsByInstructor = async (insId) => {
  const q = `
    SELECT 
      e.*, 
      s.sub_name AS subject_name, 
      s.sub_miscode,
      st.stud_fname, 
      st.stud_lname,
      st.stud_course,
      st.stud_year
    FROM evaluation e
    LEFT JOIN subject_table s ON e.sub_id = s.sub_id
    LEFT JOIN student st ON e.stud_id = st.stud_id
    WHERE e.ins_id = $1::bigint
    ORDER BY e.ev_id DESC;
  `;
  const { rows } = await pool.query(q, [insId]);
  return rows;
};

export const getEvaluationsByStudent = async (studId) => {
  const q = `
    SELECT 
      e.*, 
      s.sub_name AS subject_name, 
      s.sub_miscode,
      i.ins_fname,
      i.ins_lname,
      i.ins_dept
    FROM evaluation e
    LEFT JOIN subject_table s ON e.sub_id = s.sub_id
    LEFT JOIN instructor i ON e.ins_id = i.ins_id
    WHERE e.stud_id = $1::bigint
    ORDER BY e.ev_id DESC;
  `;
  const { rows } = await pool.query(q, [studId]);
  return rows;
};

export const updateEvaluation = async (id, payload) => {
  const q = `
    UPDATE evaluation 
    SET 
      ev_C1 = COALESCE($1::numeric(3,2), ev_C1),
      ev_C2 = COALESCE($2::numeric(3,2), ev_C2),
      ev_C3 = COALESCE($3::numeric(3,2), ev_C3),
      ev_C4 = COALESCE($4::numeric(3,2), ev_C4),
      ev_C5 = COALESCE($5::numeric(3,2), ev_C5),
      ev_total_rating = ROUND((
        COALESCE($1::numeric, ev_C1) + 
        COALESCE($2::numeric, ev_C2) + 
        COALESCE($3::numeric, ev_C3) + 
        COALESCE($4::numeric, ev_C4) + 
        COALESCE($5::numeric, ev_C5)
      ) / 5.0, 3),
      ev_remark = COALESCE($6::text, ev_remark)
    WHERE ev_id = $7::integer
    RETURNING *;
  `;
  
  const { rows } = await pool.query(q, [
    payload.ev_C1,
    payload.ev_C2,
    payload.ev_C3,
    payload.ev_C4,
    payload.ev_C5,
    payload.ev_remark,
    id
  ]);
  
  return rows[0];
};

export const deleteEvaluation = async (id) => {
  await pool.query('DELETE FROM evaluation WHERE ev_id = $1::integer;', [id]);
};

// NEW HELPER FUNCTIONS
export const getEvaluableInstructors = async (studId) => {
  const { rows } = await pool.query('SELECT * FROM get_evaluable_instructors($1);', [studId]);
  return rows;
};

export const canEvaluate = async (studId, insId, subId) => {
  const { rows } = await pool.query(
    'SELECT can_evaluate_instructor($1, $2, $3) as can_evaluate;', 
    [studId, insId, subId]
  );
  return rows[0].can_evaluate;
};

export const getEvaluationStats = async (insId) => {
  const { rows } = await pool.query(`
    SELECT 
      COUNT(*) as total_evaluations,
      ROUND(AVG(ev_total_rating), 2) as average_rating,
      ROUND(AVG(ev_C1), 2) as avg_c1,
      ROUND(AVG(ev_C2), 2) as avg_c2,
      ROUND(AVG(ev_C3), 2) as avg_c3,
      ROUND(AVG(ev_C4), 2) as avg_c4,
      ROUND(AVG(ev_C5), 2) as avg_c5
    FROM evaluation 
    WHERE ins_id = $1;
  `, [insId]);
  return rows[0];
};