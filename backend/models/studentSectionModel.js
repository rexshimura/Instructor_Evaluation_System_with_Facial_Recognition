// models/studentSectionModel.js
import pool from '../db/pool.js';

export const createStudentSection = async (sect_id, stud_id) => {
  const { rows } = await pool.query(
    'SELECT * FROM student_section_create($1, $2);',
    [sect_id, stud_id]
  );
  return rows[0];
};

export const getAllStudentSections = async () => {
  const { rows } = await pool.query(`
    SELECT 
      ss.studSect_id,
      ss.section_id,  -- CHANGED FROM sect_id TO section_id
      ss.stud_id,
      s.stud_fname,
      s.stud_lname,
      s.stud_course,
      sect.sect_name,
      sect.sect_course as section_course
    FROM student_section ss
    JOIN student s ON ss.stud_id = s.stud_id
    JOIN section_table sect ON ss.section_id = sect.section_id  -- CHANGED HERE
    ORDER BY ss.studSect_id DESC;
  `);
  return rows;
};

export const getSectionsByStudent = async (studId) => {
  const { rows } = await pool.query(`
    SELECT 
      ss.studSect_id,
      ss.section_id,  -- CHANGED FROM sect_id TO section_id
      sect.sect_name,
      sect.sect_course,
      sect.sect_semester,
      sect.sect_year_level,
      sect.sect_school_year
    FROM student_section ss 
    JOIN section_table sect ON ss.section_id = sect.section_id  -- CHANGED HERE
    WHERE ss.stud_id = $1
    ORDER BY sect.sect_name;
  `, [studId]);
  return rows;
};

export const getStudentsBySection = async (sectionId) => {
  const { rows } = await pool.query(`
    SELECT 
      ss.studSect_id,
      ss.stud_id,
      s.stud_fname,
      s.stud_mname,
      s.stud_lname,
      s.stud_suffix,
      s.stud_course,
      s.stud_year,
      s.stud_semester
    FROM student_section ss
    JOIN student s ON ss.stud_id = s.stud_id
    WHERE ss.section_id = $1  -- CHANGED FROM sect_id TO section_id
    ORDER BY s.stud_lname, s.stud_fname;
  `, [sectionId]);
  return rows;
};

export const deleteStudentSection = async (id) => {
  await pool.query('SELECT student_section_delete($1);', [id]);
};