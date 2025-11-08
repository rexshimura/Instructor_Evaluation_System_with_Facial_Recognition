-- =====================================================
-- COMPLETE DATABASE SCHEMA - FACULTY EVALUATION SYSTEM
-- =====================================================

-- BEGIN TRANSACTION
BEGIN;

-- =====================================================
-- DROP EVERYTHING FIRST (clean slate)
-- =====================================================
DROP TABLE IF EXISTS section_subject_instructor CASCADE;
DROP TABLE IF EXISTS student_section CASCADE;
DROP TABLE IF EXISTS evaluation CASCADE;
DROP TABLE IF EXISTS log_table CASCADE;
DROP TABLE IF EXISTS instructor_subject CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS section_table CASCADE;
DROP TABLE IF EXISTS subject_table CASCADE;
DROP TABLE IF EXISTS instructor CASCADE;
DROP TABLE IF EXISTS moderator CASCADE;
DROP TABLE IF EXISTS admin_table CASCADE;
DROP TABLE IF EXISTS instructor_face CASCADE;


DROP SEQUENCE IF EXISTS seq_student;
DROP SEQUENCE IF EXISTS seq_instructor_counter;
DROP SEQUENCE IF EXISTS seq_subject;
DROP SEQUENCE IF EXISTS seq_section;
DROP SEQUENCE IF EXISTS seq_in_sub;
DROP SEQUENCE IF EXISTS seq_mod;
DROP SEQUENCE IF EXISTS seq_admin;
DROP SEQUENCE IF EXISTS seq_log;
DROP SEQUENCE IF EXISTS seq_ev;
DROP SEQUENCE IF EXISTS seq_stud_sect;
DROP SEQUENCE IF EXISTS seq_ssi;
DROP SEQUENCE IF EXISTS seq_face;


-- =====================================================
-- SEQUENCES (start values as requested)
-- =====================================================
CREATE SEQUENCE seq_student START 1;
CREATE SEQUENCE seq_instructor_counter START 1;
CREATE SEQUENCE seq_subject START 101;
CREATE SEQUENCE seq_section START 1001;
CREATE SEQUENCE seq_in_sub START 1;
CREATE SEQUENCE seq_mod START 10001;
CREATE SEQUENCE seq_admin START 100;
CREATE SEQUENCE seq_log START 1;
CREATE SEQUENCE seq_ev START 1;
CREATE SEQUENCE seq_stud_sect START 1;
CREATE SEQUENCE seq_ssi START 1;
CREATE SEQUENCE seq_face START 1;

-- =====================================================
-- CREATE MAIN TABLES (order matters for FKs)
-- =====================================================

-- ADMIN TABLE
CREATE TABLE admin_table (
  admin_id        INTEGER PRIMARY KEY DEFAULT nextval('seq_admin'),
  admin_code      TEXT NOT NULL UNIQUE,
  admin_username  TEXT NOT NULL UNIQUE,
  admin_password  TEXT NOT NULL,
  admin_fname     TEXT NOT NULL,
  admin_mname     TEXT NOT NULL,
  admin_lname     TEXT NOT NULL,
  date_created    TIMESTAMP NOT NULL DEFAULT now(),
  created_by      TEXT NOT NULL
);

-- MODERATOR TABLE
CREATE TABLE moderator (
  mod_id       INTEGER PRIMARY KEY DEFAULT nextval('seq_mod'),
  mod_username TEXT NOT NULL UNIQUE,
  mod_password TEXT NOT NULL,
  mod_fname    TEXT NOT NULL,
  mod_mname    TEXT NOT NULL,
  mod_lname    TEXT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT now(),
  created_by   TEXT NOT NULL
);

-- INSTRUCTOR TABLE
CREATE TABLE instructor (
  ins_id     BIGINT PRIMARY KEY,
  ins_fname  TEXT NOT NULL,
  ins_mname  TEXT NOT NULL,
  ins_lname  TEXT NOT NULL,
  ins_suffix TEXT,
  ins_dob    DATE NOT NULL,
  ins_sex    TEXT NOT NULL,
  ins_email  TEXT NOT NULL UNIQUE,
  ins_contact TEXT NOT NULL,
  ins_dept   TEXT NOT NULL
);

-- FACE RECOGNITION TABLE
CREATE TABLE instructor_face (
    face_id INTEGER PRIMARY KEY DEFAULT nextval('seq_ssi'), -- Reusing sequence
    ins_id BIGINT NOT NULL REFERENCES instructor(ins_id) ON DELETE CASCADE,
    face_uuid TEXT NOT NULL UNIQUE,
    date_created TIMESTAMP NOT NULL DEFAULT now(),
    created_by TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- SUBJECT TABLE
CREATE TABLE subject_table (
  sub_id       INTEGER PRIMARY KEY DEFAULT nextval('seq_subject'),
  sub_name     TEXT NOT NULL,
  sub_miscode  TEXT,
  sub_semester INTEGER NOT NULL,
  sub_year     INTEGER NOT NULL,
  sub_course   TEXT NOT NULL,
  sub_units    INTEGER NOT NULL
);

-- SECTION TABLE
CREATE TABLE section_table (
  section_id      INTEGER PRIMARY KEY DEFAULT nextval('seq_section'),
  sect_semester   INTEGER NOT NULL,
  sect_name       TEXT NOT NULL,
  sect_year_level INTEGER NOT NULL,
  sect_school_year TEXT NOT NULL,
  sect_course     TEXT NOT NULL
);

-- INSTRUCTOR-SUBJECT TABLE (many-to-many linking)
CREATE TABLE instructor_subject (
  insub_id INTEGER PRIMARY KEY DEFAULT nextval('seq_in_sub'),
  ins_id   BIGINT NOT NULL REFERENCES instructor(ins_id) ON DELETE CASCADE,
  sub_id   INTEGER NOT NULL REFERENCES subject_table(sub_id) ON DELETE CASCADE,
  UNIQUE(ins_id, sub_id)
);

-- STUDENT TABLE
CREATE TABLE student (
  stud_id      BIGINT PRIMARY KEY,
  stud_fname   TEXT NOT NULL,
  stud_mname   TEXT NOT NULL,
  stud_lname   TEXT NOT NULL,
  stud_suffix  TEXT,
  stud_dob     DATE NOT NULL,
  stud_sex     TEXT NOT NULL,
  stud_course  TEXT NOT NULL,
  stud_year    INTEGER NOT NULL,
  stud_section TEXT NOT NULL,
  stud_semester INTEGER NOT NULL
);

-- STUDENT-SECTION TABLE (many-to-many linking)
CREATE TABLE student_section (
  studSect_id INTEGER PRIMARY KEY DEFAULT nextval('seq_stud_sect'),
  section_id  INTEGER NOT NULL REFERENCES section_table(section_id) ON DELETE CASCADE,
  stud_id     BIGINT NOT NULL REFERENCES student(stud_id) ON DELETE CASCADE,
  UNIQUE(section_id, stud_id)
);

-- SECTION-SUBJECT-INSTRUCTOR TABLE (links sections to instructor-subject combinations)
CREATE TABLE section_subject_instructor (
  ssi_id      INTEGER PRIMARY KEY DEFAULT nextval('seq_ssi'),
  section_id  INTEGER NOT NULL REFERENCES section_table(section_id) ON DELETE CASCADE,
  insub_id    INTEGER NOT NULL REFERENCES instructor_subject(insub_id) ON DELETE CASCADE,
  UNIQUE(section_id, insub_id)
);

-- EVALUATION TABLE
CREATE TABLE evaluation (
  ev_id          INTEGER PRIMARY KEY DEFAULT nextval('seq_ev'),
  ev_date        TIMESTAMP NOT NULL DEFAULT now(),
  ev_subject     TEXT NOT NULL,
  ev_semester    INTEGER NOT NULL,
  ev_C1          NUMERIC(3,2) NOT NULL CHECK (ev_C1 >= 1.00 AND ev_C1 <= 5.00),
  ev_C2          NUMERIC(3,2) NOT NULL CHECK (ev_C2 >= 1.00 AND ev_C2 <= 5.00),
  ev_C3          NUMERIC(3,2) NOT NULL CHECK (ev_C3 >= 1.00 AND ev_C3 <= 5.00),
  ev_C4          NUMERIC(3,2) NOT NULL CHECK (ev_C4 >= 1.00 AND ev_C4 <= 5.00),
  ev_C5          NUMERIC(3,2) NOT NULL CHECK (ev_C5 >= 1.00 AND ev_C5 <= 5.00),
  ev_total_rating NUMERIC(4,3) NOT NULL,
  ev_remark      TEXT NOT NULL DEFAULT '',
  sub_id         INTEGER NOT NULL REFERENCES subject_table(sub_id) ON DELETE RESTRICT,
  stud_id        BIGINT NOT NULL REFERENCES student(stud_id) ON DELETE CASCADE,
  ins_id         BIGINT NOT NULL REFERENCES instructor(ins_id) ON DELETE CASCADE,
  UNIQUE(stud_id, ins_id, sub_id)
);

-- LOG TABLE
CREATE TABLE log_table (
  log_id    INTEGER PRIMARY KEY DEFAULT nextval('seq_log'),
  mod_id    INTEGER REFERENCES moderator(mod_id) ON DELETE SET NULL,
  ins_id    BIGINT REFERENCES instructor(ins_id) ON DELETE SET NULL,
  log_action TEXT NOT NULL,
  log_date  TIMESTAMP NOT NULL DEFAULT now()
);

-- =====================================================
-- TRIGGERS & FUNCTIONS (FIXED VERSIONS)
-- =====================================================

-- 1) Instructor ID generator trigger
CREATE OR REPLACE FUNCTION fn_generate_ins_id()
RETURNS TRIGGER AS $$
DECLARE
  prefix INTEGER;
  counter_val INTEGER;
BEGIN
  IF NEW.ins_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  CASE upper(NEW.ins_dept)
    WHEN 'BSIT' THEN prefix := 101;
    WHEN 'BSIS' THEN prefix := 102;
    ELSE prefix := 103;
  END CASE;

  SELECT nextval('seq_instructor_counter') INTO counter_val;
  NEW.ins_id := (prefix * 10000) + counter_val;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ins_before_insert
BEFORE INSERT ON instructor
FOR EACH ROW
EXECUTE FUNCTION fn_generate_ins_id();

-- 2) Subject miscode auto-update trigger
CREATE OR REPLACE FUNCTION fn_set_sub_miscode()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
BEGIN
  IF position('IT' IN UPPER(NEW.sub_course)) > 0 THEN
    prefix := 'IT';
  ELSE
    prefix := LEFT(UPPER(NEW.sub_course), 2);
  END IF;

  NEW.sub_miscode := prefix || NEW.sub_id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sub_before_insert
BEFORE INSERT ON subject_table
FOR EACH ROW
EXECUTE FUNCTION fn_set_sub_miscode();

-- 3) Student ID generator trigger
CREATE OR REPLACE FUNCTION fn_generate_stud_id()
RETURNS TRIGGER AS $$
DECLARE
  yr INTEGER;
  seqnum INTEGER;
BEGIN
  IF NEW.stud_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  yr := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
  SELECT nextval('seq_student') INTO seqnum;
  NEW.stud_id := (yr * 10000) + seqnum;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_student_before_insert
BEFORE INSERT ON student
FOR EACH ROW
EXECUTE FUNCTION fn_generate_stud_id();

-- =====================================================
-- EVALUATION SYSTEM FUNCTIONS
-- =====================================================

-- Function to check if student can evaluate instructor
CREATE OR REPLACE FUNCTION can_evaluate_instructor(
  p_stud_id BIGINT, 
  p_ins_id BIGINT, 
  p_sub_id INTEGER
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM student_section ss
    JOIN section_subject_instructor ssi ON ss.section_id = ssi.section_id
    JOIN instructor_subject insub ON ssi.insub_id = insub.insub_id
    WHERE ss.stud_id = p_stud_id 
    AND insub.ins_id = p_ins_id
    AND insub.sub_id = p_sub_id
    AND NOT EXISTS (
      SELECT 1 FROM evaluation e 
      WHERE e.stud_id = p_stud_id 
      AND e.ins_id = p_ins_id 
      AND e.sub_id = p_sub_id
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get evaluable instructors for a student
CREATE OR REPLACE FUNCTION get_evaluable_instructors(p_stud_id BIGINT)
RETURNS TABLE(
  instructor_id BIGINT,
  instructor_name TEXT,
  subject_id INTEGER,
  subject_name TEXT,
  section_id INTEGER,
  section_name TEXT
) AS $$
BEGIN
  RETURN QUERY
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
  WHERE ss.stud_id = p_stud_id
  AND NOT EXISTS (
    SELECT 1 FROM evaluation e 
    WHERE e.stud_id = p_stud_id 
    AND e.ins_id = i.ins_id 
    AND e.sub_id = sub.sub_id
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CRUD FUNCTIONS
-- =====================================================

-- STUDENT CRUD FUNCTIONS
CREATE OR REPLACE FUNCTION student_create(
  p_fname TEXT, p_mname TEXT, p_lname TEXT, p_suffix TEXT,
  p_dob DATE, p_sex TEXT, p_course TEXT, p_year INTEGER, 
  p_section TEXT, p_semester INTEGER
) RETURNS student AS $$
DECLARE 
  _s student%ROWTYPE;
BEGIN
  INSERT INTO student(stud_fname, stud_mname, stud_lname, stud_suffix, stud_dob, stud_sex, stud_course, stud_year, stud_section, stud_semester)
  VALUES (p_fname, p_mname, p_lname, p_suffix, p_dob, p_sex, p_course, p_year, p_section, p_semester)
  RETURNING * INTO _s;
  RETURN _s;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION student_read(p_stud_id BIGINT) RETURNS student AS $$
DECLARE _s student%ROWTYPE;
BEGIN
  SELECT * INTO _s FROM student WHERE stud_id = p_stud_id;
  RETURN _s;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION student_update(
  p_stud_id BIGINT, p_fname TEXT, p_mname TEXT, p_lname TEXT
) RETURNS student AS $$
DECLARE _s student%ROWTYPE;
BEGIN
  UPDATE student 
  SET 
    stud_fname = COALESCE(p_fname, stud_fname),
    stud_mname = COALESCE(p_mname, stud_mname),
    stud_lname = COALESCE(p_lname, stud_lname)
  WHERE stud_id = p_stud_id
  RETURNING * INTO _s;
  RETURN _s;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION student_delete(p_stud_id BIGINT) RETURNS VOID AS $$
BEGIN
  DELETE FROM student WHERE stud_id = p_stud_id;
END;
$$ LANGUAGE plpgsql;

-- INSTRUCTOR CRUD FUNCTIONS
CREATE OR REPLACE FUNCTION instructor_create(
  p_fname TEXT, p_mname TEXT, p_lname TEXT, p_suffix TEXT,
  p_dob DATE, p_sex TEXT, p_email TEXT, p_contact TEXT, p_dept TEXT
) RETURNS instructor AS $$
DECLARE 
  _i instructor%ROWTYPE;
BEGIN
  INSERT INTO instructor(ins_fname, ins_mname, ins_lname, ins_suffix, ins_dob, ins_sex, ins_email, ins_contact, ins_dept)
  VALUES (p_fname, p_mname, p_lname, p_suffix, p_dob, p_sex, p_email, p_contact, p_dept)
  RETURNING * INTO _i;
  RETURN _i;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION instructor_read(p_ins_id BIGINT) RETURNS instructor AS $$
DECLARE _i instructor%ROWTYPE;
BEGIN
  SELECT * INTO _i FROM instructor WHERE ins_id = p_ins_id;
  RETURN _i;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION instructor_update(
  p_ins_id BIGINT, p_email TEXT, p_contact TEXT
) RETURNS instructor AS $$
DECLARE _i instructor%ROWTYPE;
BEGIN
  UPDATE instructor 
  SET 
    ins_email = COALESCE(p_email, ins_email),
    ins_contact = COALESCE(p_contact, ins_contact)
  WHERE ins_id = p_ins_id
  RETURNING * INTO _i;
  RETURN _i;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION instructor_delete(p_ins_id BIGINT) RETURNS VOID AS $$
BEGIN
  DELETE FROM instructor WHERE ins_id = p_ins_id;
END;
$$ LANGUAGE plpgsql;

-- FACE RECOGNITION CRUD FUNCTIONS
CREATE OR REPLACE FUNCTION instructor_face_create(
    p_ins_id BIGINT,
    p_face_uuid TEXT,
    p_face_image_url TEXT,
    p_created_by TEXT
) RETURNS instructor_face AS $$
DECLARE 
    _f instructor_face%ROWTYPE;
BEGIN
    INSERT INTO instructor_face(ins_id, face_uuid, face_image_url, created_by)
    VALUES (p_ins_id, p_face_uuid, p_face_image_url, p_created_by)
    RETURNING * INTO _f;
    RETURN _f;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION instructor_face_read(p_face_id INTEGER) RETURNS instructor_face AS $$
DECLARE _f instructor_face%ROWTYPE;
BEGIN
    SELECT * INTO _f FROM instructor_face WHERE face_id = p_face_id;
    RETURN _f;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION instructor_face_read_by_uuid(p_face_uuid TEXT) RETURNS instructor_face AS $$
DECLARE _f instructor_face%ROWTYPE;
BEGIN
    SELECT * INTO _f FROM instructor_face WHERE face_uuid = p_face_uuid;
    RETURN _f;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION instructor_face_read_by_instructor(p_ins_id BIGINT) RETURNS SETOF instructor_face AS $$
BEGIN
    RETURN QUERY SELECT * FROM instructor_face WHERE ins_id = p_ins_id AND is_active = true;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION instructor_face_deactivate(p_face_id INTEGER) RETURNS instructor_face AS $$
DECLARE _f instructor_face%ROWTYPE;
BEGIN
    UPDATE instructor_face 
    SET is_active = false
    WHERE face_id = p_face_id
    RETURNING * INTO _f;
    RETURN _f;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION instructor_face_delete(p_face_id INTEGER) RETURNS VOID AS $$
BEGIN
    DELETE FROM instructor_face WHERE face_id = p_face_id;
END;
$$ LANGUAGE plpgsql;

-- SUBJECT CRUD FUNCTIONS
CREATE OR REPLACE FUNCTION subject_create(
  p_name TEXT, p_semester INTEGER, p_year INTEGER, p_course TEXT, p_units INTEGER
) RETURNS subject_table AS $$
DECLARE 
  _s subject_table%ROWTYPE;
BEGIN
  INSERT INTO subject_table(sub_name, sub_semester, sub_year, sub_course, sub_units)
  VALUES (p_name, p_semester, p_year, p_course, p_units)
  RETURNING * INTO _s;
  RETURN _s;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION subject_read(p_sub_id INTEGER) RETURNS subject_table AS $$
DECLARE _s subject_table%ROWTYPE;
BEGIN
  SELECT * INTO _s FROM subject_table WHERE sub_id = p_sub_id;
  RETURN _s;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION subject_update(
  p_sub_id INTEGER, p_name TEXT, p_semester INTEGER, p_year INTEGER, p_course TEXT, p_units INTEGER
) RETURNS subject_table AS $$
DECLARE _s subject_table%ROWTYPE;
BEGIN
  UPDATE subject_table 
  SET 
    sub_name = COALESCE(p_name, sub_name),
    sub_semester = COALESCE(p_semester, sub_semester),
    sub_year = COALESCE(p_year, sub_year),
    sub_course = COALESCE(p_course, sub_course),
    sub_units = COALESCE(p_units, sub_units)
  WHERE sub_id = p_sub_id
  RETURNING * INTO _s;
  RETURN _s;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION subject_delete(p_sub_id INTEGER) RETURNS VOID AS $$
BEGIN
  DELETE FROM subject_table WHERE sub_id = p_sub_id;
END;
$$ LANGUAGE plpgsql;

-- SECTION CRUD FUNCTIONS
CREATE OR REPLACE FUNCTION section_create(
  p_semester INTEGER, p_name TEXT, p_year_level INTEGER, p_school_year TEXT, p_course TEXT
) RETURNS section_table AS $$
DECLARE 
  _s section_table%ROWTYPE;
BEGIN
  INSERT INTO section_table(sect_semester, sect_name, sect_year_level, sect_school_year, sect_course)
  VALUES (p_semester, p_name, p_year_level, p_school_year, p_course)
  RETURNING * INTO _s;
  RETURN _s;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION section_read(p_section_id INTEGER) RETURNS section_table AS $$
DECLARE _s section_table%ROWTYPE;
BEGIN
  SELECT * INTO _s FROM section_table WHERE section_id = p_section_id;
  RETURN _s;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION section_update(p_section_id INTEGER, p_name TEXT) RETURNS section_table AS $$
DECLARE _s section_table%ROWTYPE;
BEGIN
  UPDATE section_table 
  SET sect_name = COALESCE(p_name, sect_name)
  WHERE section_id = p_section_id
  RETURNING * INTO _s;
  RETURN _s;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION section_delete(p_section_id INTEGER) RETURNS VOID AS $$
BEGIN
  DELETE FROM section_table WHERE section_id = p_section_id;
END;
$$ LANGUAGE plpgsql;

-- STUDENT-SECTION FUNCTIONS
CREATE OR REPLACE FUNCTION student_section_create(p_section_id INTEGER, p_stud_id BIGINT)
RETURNS student_section AS $$
DECLARE 
  _ss student_section%ROWTYPE;
BEGIN
  INSERT INTO student_section(section_id, stud_id)
  VALUES (p_section_id, p_stud_id)
  RETURNING * INTO _ss;
  RETURN _ss;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION student_section_delete(p_id INTEGER) RETURNS VOID AS $$
BEGIN
  DELETE FROM student_section WHERE studSect_id = p_id;
END;
$$ LANGUAGE plpgsql;

-- LOG FUNCTION
CREATE OR REPLACE FUNCTION log_action(p_mod_id INTEGER, p_ins_id BIGINT, p_action TEXT) RETURNS log_table AS $$
DECLARE _l log_table%ROWTYPE;
BEGIN
  INSERT INTO log_table(mod_id, ins_id, log_action) 
  VALUES (p_mod_id, p_ins_id, p_action) 
  RETURNING * INTO _l;
  RETURN _l;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA INSERTS (SIMPLIFIED TO AVOID SUBQUERY ERRORS)
-- =====================================================

-- Insert sample data with explicit values to avoid subquery issues
INSERT INTO admin_table (admin_code, admin_username, admin_password, admin_fname, admin_mname, admin_lname, created_by)
VALUES 
('admin_101', 'admin', 'admin123', 'Admin', 'System', 'User', 'System');

INSERT INTO moderator (mod_username, mod_password, mod_fname, mod_mname, mod_lname, created_by)
VALUES 
('moderator1', 'mod123', 'John', 'A', 'Moderator', 'Admin'),
('rexshimura', 'mod123', 'Rex', 'T', 'Shimura', 'Admin');

-- Insert instructors (IDs will be auto-generated by trigger)
INSERT INTO instructor (ins_fname, ins_mname, ins_lname, ins_suffix, ins_dob, ins_sex, ins_email, ins_contact, ins_dept)
VALUES 
('Michael', 'J', 'Smith', 'JR.', '1980-05-15', 'Male', 'msmith@email.com', '0912-345-6789', 'BSIT'),
('Sarah', 'L', 'Johnson', '', '1985-08-22', 'Female', 'sjohnson@email.com', '0912-345-6790', 'BSIS'),
('David', 'K', 'Williams', '', '1978-12-10', 'Male', 'dwilliams@email.com', '0912-345-6791', 'BSCS');

-- Insert subjects
INSERT INTO subject_table (sub_name, sub_semester, sub_year, sub_course, sub_units)
VALUES 
('Introduction to Computing', 1, 1, 'BSIT', 3),
('Programming Fundamentals', 1, 1, 'BSIT', 4),
('Database Management', 2, 1, 'BSIT', 3),
('Web Development', 2, 1, 'BSIT', 3),
('Information Systems', 1, 1, 'BSIS', 3);

-- Insert sections
INSERT INTO section_table (sect_semester, sect_name, sect_year_level, sect_school_year, sect_course)
VALUES 
(1, 'A', 1, '2025-2026', 'BSIT'),
(1, 'B', 1, '2025-2026', 'BSIT'),
(2, 'A', 1, '2025-2026', 'BSIT'),
(1, 'A', 1, '2025-2026', 'BSIS');

-- Insert students (IDs will be auto-generated by trigger)
INSERT INTO student (stud_fname, stud_mname, stud_lname, stud_suffix, stud_dob, stud_sex, stud_course, stud_year, stud_section, stud_semester)
VALUES 
('Alice', 'Marie', 'Johnson', '', '2002-05-14', 'Female', 'BSIT', 1, 'A', 1),
('Bob', 'James', 'Smith', '', '2003-02-20', 'Male', 'BSIT', 1, 'A', 1),
('Carol', 'Ann', 'Williams', '', '2002-11-08', 'Female', 'BSIS', 1, 'A', 1);

-- Now create temporary variables to store IDs for the relationships
DO $$
DECLARE
  michael_id BIGINT;
  sarah_id BIGINT;
  david_id BIGINT;
  intro_sub_id INTEGER;
  programming_sub_id INTEGER;
  database_sub_id INTEGER;
  web_sub_id INTEGER;
  bsit_section_a_id INTEGER;
  bsit_section_b_id INTEGER;
  bsit_section_2a_id INTEGER;
  bsis_section_a_id INTEGER;
  alice_id BIGINT;
  bob_id BIGINT;
  carol_id BIGINT;
BEGIN
  -- Get instructor IDs
  SELECT ins_id INTO michael_id FROM instructor WHERE ins_email = 'msmith@email.com';
  SELECT ins_id INTO sarah_id FROM instructor WHERE ins_email = 'sjohnson@email.com';
  SELECT ins_id INTO david_id FROM instructor WHERE ins_email = 'dwilliams@email.com';
  
  -- Get subject IDs
  SELECT sub_id INTO intro_sub_id FROM subject_table WHERE sub_name = 'Introduction to Computing';
  SELECT sub_id INTO programming_sub_id FROM subject_table WHERE sub_name = 'Programming Fundamentals';
  SELECT sub_id INTO database_sub_id FROM subject_table WHERE sub_name = 'Database Management';
  SELECT sub_id INTO web_sub_id FROM subject_table WHERE sub_name = 'Web Development';
  
  -- Get section IDs
  SELECT section_id INTO bsit_section_a_id FROM section_table WHERE sect_name = 'A' AND sect_course = 'BSIT' AND sect_semester = 1;
  SELECT section_id INTO bsit_section_b_id FROM section_table WHERE sect_name = 'B' AND sect_course = 'BSIT' AND sect_semester = 1;
  SELECT section_id INTO bsit_section_2a_id FROM section_table WHERE sect_name = 'A' AND sect_course = 'BSIT' AND sect_semester = 2;
  SELECT section_id INTO bsis_section_a_id FROM section_table WHERE sect_name = 'A' AND sect_course = 'BSIS' AND sect_semester = 1;
  
  -- Get student IDs
  SELECT stud_id INTO alice_id FROM student WHERE stud_fname = 'Alice' AND stud_lname = 'Johnson';
  SELECT stud_id INTO bob_id FROM student WHERE stud_fname = 'Bob' AND stud_lname = 'Smith';
  SELECT stud_id INTO carol_id FROM student WHERE stud_fname = 'Carol' AND stud_lname = 'Williams';
  
  -- Insert instructor-subject relationships
  INSERT INTO instructor_subject (ins_id, sub_id) VALUES (michael_id, intro_sub_id);
  INSERT INTO instructor_subject (ins_id, sub_id) VALUES (michael_id, programming_sub_id);
  INSERT INTO instructor_subject (ins_id, sub_id) VALUES (sarah_id, database_sub_id);
  INSERT INTO instructor_subject (ins_id, sub_id) VALUES (david_id, web_sub_id);
  
  -- Insert student-section relationships
  INSERT INTO student_section (section_id, stud_id) VALUES (bsit_section_a_id, alice_id);
  INSERT INTO student_section (section_id, stud_id) VALUES (bsit_section_a_id, bob_id);
  INSERT INTO student_section (section_id, stud_id) VALUES (bsis_section_a_id, carol_id);
  
  -- Insert section-subject-instructor relationships
  INSERT INTO section_subject_instructor (section_id, insub_id) 
  VALUES (bsit_section_a_id, (SELECT insub_id FROM instructor_subject WHERE ins_id = michael_id AND sub_id = intro_sub_id));
  
  INSERT INTO section_subject_instructor (section_id, insub_id) 
  VALUES (bsit_section_a_id, (SELECT insub_id FROM instructor_subject WHERE ins_id = michael_id AND sub_id = programming_sub_id));
  
  -- Insert evaluation
  INSERT INTO evaluation (ev_subject, ev_semester, ev_C1, ev_C2, ev_C3, ev_C4, ev_C5, ev_total_rating, ev_remark, sub_id, stud_id, ins_id)
  VALUES ('Introduction to Computing', 1, 4.5, 4.0, 4.5, 4.0, 4.5, 4.3, 'Excellent instructor', intro_sub_id, alice_id, michael_id);
  
  -- Insert log
  INSERT INTO log_table (mod_id, ins_id, log_action)
  VALUES ((SELECT mod_id FROM moderator WHERE mod_username = 'rexshimura'), michael_id, 'Registered Instructor');
  
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

SELECT '=== DATABASE SETUP COMPLETE ===' as status;

SELECT 'Tables created:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 'Sample data counts:' as info;
SELECT 'Instructors' as table_name, COUNT(*) as count FROM instructor
UNION ALL SELECT 'Students', COUNT(*) FROM student
UNION ALL SELECT 'Subjects', COUNT(*) FROM subject_table
UNION ALL SELECT 'Sections', COUNT(*) FROM section_table
UNION ALL SELECT 'Evaluations', COUNT(*) FROM evaluation
UNION ALL SELECT 'Moderators', COUNT(*) FROM moderator
UNION ALL SELECT 'Instructor-Subject Links', COUNT(*) FROM instructor_subject
UNION ALL SELECT 'Student-Section Links', COUNT(*) FROM student_section
UNION ALL SELECT 'Section-Assignments', COUNT(*) FROM section_subject_instructor
ORDER BY table_name;

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================
COMMIT;

SELECT '=== DATABASE READY FOR USE ===' as final_status;
