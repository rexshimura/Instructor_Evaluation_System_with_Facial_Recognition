// models/sectionSubjectInstructorModel.js
import pool from '../db/pool.js';

export const createSSI = async (section_id, insub_id) => {
  const { rows } = await pool.query(
    'INSERT INTO section_subject_instructor (section_id, insub_id) VALUES ($1, $2) RETURNING *;',
    [section_id, insub_id]
  );
  return rows[0];
};

export const getAllSSIAssignments = async () => {
  const { rows } = await pool.query(`
    SELECT 
      ssi.ssi_id,
      ssi.section_id,
      ssi.insub_id,
      sect.sect_name,
      sect.sect_course as section_course,
      i.ins_id,
      i.ins_fname,
      i.ins_lname,
      i.ins_dept,
      sub.sub_id,
      sub.sub_name,
      sub.sub_miscode,
      sub.sub_course as subject_course
    FROM section_subject_instructor ssi
    JOIN section_table sect ON ssi.section_id = sect.section_id
    JOIN instructor_subject insub ON ssi.insub_id = insub.insub_id
    JOIN instructor i ON insub.ins_id = i.ins_id
    JOIN subject_table sub ON insub.sub_id = sub.sub_id
    ORDER BY ssi.ssi_id DESC;
  `);
  return rows;
};

export const getBySection = async (sectionId) => {
  const { rows } = await pool.query(`
    SELECT 
      ssi.ssi_id,
      ssi.insub_id,
      i.ins_id,
      i.ins_fname,
      i.ins_lname,
      i.ins_dept,
      sub.sub_id,
      sub.sub_name,
      sub.sub_miscode,
      sub.sub_units
    FROM section_subject_instructor ssi
    JOIN instructor_subject insub ON ssi.insub_id = insub.insub_id
    JOIN instructor i ON insub.ins_id = i.ins_id
    JOIN subject_table sub ON insub.sub_id = sub.sub_id
    WHERE ssi.section_id = $1
    ORDER BY sub.sub_name;
  `, [sectionId]);
  return rows;
};

export const getByInstructor = async (insId) => {
  const { rows } = await pool.query(`
    SELECT 
      ssi.ssi_id,
      ssi.section_id,
      sect.sect_name,
      sect.sect_course,
      sect.sect_semester,
      sect.sect_year_level,
      sub.sub_id,
      sub.sub_name,
      sub.sub_miscode
    FROM section_subject_instructor ssi
    JOIN section_table sect ON ssi.section_id = sect.section_id
    JOIN instructor_subject insub ON ssi.insub_id = insub.insub_id
    JOIN subject_table sub ON insub.sub_id = sub.sub_id
    WHERE insub.ins_id = $1
    ORDER BY sect.sect_name, sub.sub_name;
  `, [insId]);
  return rows;
};

export const getEvaluableInstructors = async (studId) => {
  // This function needs the student_section table to work properly
  const { rows } = await pool.query(`
    SELECT DISTINCT
      i.ins_id as instructor_id,
      i.ins_fname || ' ' || i.ins_lname as instructor_name,
      sub.sub_id as subject_id,
      sub.sub_name as subject_name,
      sect.section_id as section_id,
      sect.sect_name as section_name
    FROM student_section ss
    JOIN section_table sect ON ss.section_id = sect.section_id
    JOIN section_subject_instructor ssi ON sect.section_id = ssi.section_id
    JOIN instructor_subject insub ON ssi.insub_id = insub.insub_id
    JOIN instructor i ON insub.ins_id = i.ins_id
    JOIN subject_table sub ON insub.sub_id = sub.sub_id
    WHERE ss.stud_id = $1
    AND NOT EXISTS (
      SELECT 1 FROM evaluation e 
      WHERE e.stud_id = $1 
      AND e.ins_id = i.ins_id 
      AND e.sub_id = sub.sub_id
    );
  `, [studId]);
  return rows;
};

export const canEvaluate = async (studId, insId, subId) => {
  const { rows } = await pool.query(
    `SELECT EXISTS (
      SELECT 1
      FROM student_section ss
      JOIN section_table s ON ss.section_id = s.section_id
      JOIN section_subject_instructor ssi ON s.section_id = ssi.section_id
      JOIN instructor_subject insub ON ssi.insub_id = insub.insub_id
      WHERE ss.stud_id = $1 
      AND insub.ins_id = $2
      AND insub.sub_id = $3
      AND NOT EXISTS (
        SELECT 1 FROM evaluation e 
        WHERE e.stud_id = $1 
        AND e.ins_id = $2 
        AND e.sub_id = $3
      )
    ) as can_evaluate;`,
    [studId, insId, subId]
  );
  return rows[0].can_evaluate;
};

export const deleteSSI = async (id) => {
  await pool.query('DELETE FROM section_subject_instructor WHERE ssi_id = $1;', [id]);
};