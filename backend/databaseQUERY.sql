-- =====================================================
-- COMPLETE DATABASE SCHEMA - FACULTY EVALUATION SYSTEM
-- (MASSIVE DATASET: 20+ Instructors, 25+ Subjects, 15 Sections, 120+ Students)
-- (UPDATED: Context-Aware Random Remarks & Scores)
-- =====================================================

-- BEGIN TRANSACTION
BEGIN;

-- =====================================================
-- 1. DROP EVERYTHING (Clean Slate)
-- =====================================================
DROP TABLE IF EXISTS section_subject_instructor CASCADE;
DROP TABLE IF EXISTS student_section CASCADE;
DROP TABLE IF EXISTS evaluation CASCADE;
DROP TABLE IF EXISTS log_table CASCADE;
DROP TABLE IF EXISTS instructor_subject CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS section_table CASCADE;
DROP TABLE IF EXISTS subject_table CASCADE;
DROP TABLE IF EXISTS instructor_face CASCADE;
DROP TABLE IF EXISTS instructor CASCADE;
DROP TABLE IF EXISTS moderator CASCADE;
DROP TABLE IF EXISTS admin_table CASCADE;

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
-- 2. SEQUENCES
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
-- 3. CREATE TABLES
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
    mod_id          INTEGER PRIMARY KEY DEFAULT nextval('seq_mod'),
    mod_username    TEXT NOT NULL UNIQUE,
    mod_password    TEXT NOT NULL,
    mod_fname       TEXT NOT NULL,
    mod_mname       TEXT NOT NULL,
    mod_lname       TEXT NOT NULL,
    date_created    TIMESTAMP NOT NULL DEFAULT now(),
    created_by      TEXT NOT NULL
);

-- INSTRUCTOR TABLE
CREATE TABLE instructor (
    ins_id          BIGINT PRIMARY KEY, 
    ins_fname       TEXT NOT NULL,
    ins_mname       TEXT NOT NULL,
    ins_lname       TEXT NOT NULL,
    ins_suffix      TEXT,
    ins_dob         DATE NOT NULL,
    ins_sex         TEXT NOT NULL,
    ins_email       TEXT NOT NULL UNIQUE,
    ins_contact     TEXT NOT NULL,
    ins_dept        TEXT NOT NULL
);

-- FACE RECOGNITION TABLE
CREATE TABLE instructor_face (
    face_id         INTEGER PRIMARY KEY DEFAULT nextval('seq_face'),
    ins_id          BIGINT NOT NULL REFERENCES instructor(ins_id) ON DELETE CASCADE,
    aws_face_id     TEXT NOT NULL UNIQUE,
    date_created    TIMESTAMP NOT NULL DEFAULT now(),
    created_by      TEXT NOT NULL,
    is_active       BOOLEAN DEFAULT true
);

-- SUBJECT TABLE
CREATE TABLE subject_table (
    sub_id          INTEGER PRIMARY KEY DEFAULT nextval('seq_subject'),
    sub_name        TEXT NOT NULL,
    sub_miscode     TEXT, 
    sub_semester    INTEGER NOT NULL,
    sub_year        INTEGER NOT NULL,
    sub_course      TEXT NOT NULL,
    sub_units       INTEGER NOT NULL
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

-- INSTRUCTOR-SUBJECT TABLE
CREATE TABLE instructor_subject (
    insub_id        INTEGER PRIMARY KEY DEFAULT nextval('seq_in_sub'),
    ins_id          BIGINT NOT NULL REFERENCES instructor(ins_id) ON DELETE CASCADE,
    sub_id          INTEGER NOT NULL REFERENCES subject_table(sub_id) ON DELETE CASCADE,
    UNIQUE(ins_id, sub_id)
);

-- STUDENT TABLE
CREATE TABLE student (
    stud_id         BIGINT PRIMARY KEY, 
    stud_fname      TEXT NOT NULL,
    stud_mname      TEXT NOT NULL,
    stud_lname      TEXT NOT NULL,
    stud_suffix     TEXT,
    stud_dob        DATE NOT NULL,
    stud_sex        TEXT NOT NULL,
    stud_course     TEXT NOT NULL,
    stud_year       INTEGER NOT NULL,
    stud_section    TEXT NOT NULL,
    stud_semester   INTEGER NOT NULL
);

-- STUDENT-SECTION TABLE
CREATE TABLE student_section (
    studSect_id     INTEGER PRIMARY KEY DEFAULT nextval('seq_stud_sect'),
    section_id      INTEGER NOT NULL REFERENCES section_table(section_id) ON DELETE CASCADE,
    stud_id         BIGINT NOT NULL REFERENCES student(stud_id) ON DELETE CASCADE,
    UNIQUE(section_id, stud_id)
);

-- SECTION-SUBJECT-INSTRUCTOR TABLE
CREATE TABLE section_subject_instructor (
    ssi_id          INTEGER PRIMARY KEY DEFAULT nextval('seq_ssi'),
    section_id      INTEGER NOT NULL REFERENCES section_table(section_id) ON DELETE CASCADE,
    insub_id        INTEGER NOT NULL REFERENCES instructor_subject(insub_id) ON DELETE CASCADE,
    UNIQUE(section_id, insub_id)
);

-- EVALUATION TABLE
CREATE TABLE evaluation (
    ev_id           INTEGER PRIMARY KEY DEFAULT nextval('seq_ev'),
    ev_date         TIMESTAMP NOT NULL DEFAULT now(),
    ev_subject      TEXT NOT NULL,
    ev_semester     INTEGER NOT NULL,
    ev_C1           NUMERIC(3,2) NOT NULL CHECK (ev_C1 >= 1.00 AND ev_C1 <= 5.00),
    ev_C2           NUMERIC(3,2) NOT NULL CHECK (ev_C2 >= 1.00 AND ev_C2 <= 5.00),
    ev_C3           NUMERIC(3,2) NOT NULL CHECK (ev_C3 >= 1.00 AND ev_C3 <= 5.00),
    ev_C4           NUMERIC(3,2) NOT NULL CHECK (ev_C4 >= 1.00 AND ev_C4 <= 5.00),
    ev_C5           NUMERIC(3,2) NOT NULL CHECK (ev_C5 >= 1.00 AND ev_C5 <= 5.00),
    ev_total_rating NUMERIC(4,3) NOT NULL,
    ev_remark       TEXT NOT NULL DEFAULT '',
    sub_id          INTEGER NOT NULL REFERENCES subject_table(sub_id) ON DELETE RESTRICT,
    stud_id         BIGINT NOT NULL REFERENCES student(stud_id) ON DELETE CASCADE,
    ins_id          BIGINT NOT NULL REFERENCES instructor(ins_id) ON DELETE CASCADE,
    UNIQUE(stud_id, ins_id, sub_id)
);

-- LOG TABLE
CREATE TABLE log_table (
    log_id          INTEGER PRIMARY KEY DEFAULT nextval('seq_log'),
    mod_id          INTEGER REFERENCES moderator(mod_id) ON DELETE SET NULL,
    ins_id          BIGINT REFERENCES instructor(ins_id) ON DELETE SET NULL,
    log_action      TEXT NOT NULL,
    log_date        TIMESTAMP NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. TRIGGERS & FUNCTIONS
-- =====================================================

-- 4.1 Instructor ID Generator
CREATE OR REPLACE FUNCTION fn_generate_ins_id()
RETURNS TRIGGER AS $$
DECLARE
    prefix INTEGER;
    counter_val INTEGER;
BEGIN
    IF NEW.ins_id IS NOT NULL THEN RETURN NEW; END IF;
    
    CASE upper(NEW.ins_dept)
        WHEN 'BSIT' THEN prefix := 101;
        WHEN 'BSIS' THEN prefix := 102;
        WHEN 'BSCS' THEN prefix := 103;
        ELSE prefix := 104; -- General Education / Others
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

-- 4.2 Subject Miscode Generator
CREATE OR REPLACE FUNCTION fn_set_sub_miscode()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
BEGIN
    IF position('IT' IN UPPER(NEW.sub_course)) > 0 THEN prefix := 'IT';
    ELSIF position('IS' IN UPPER(NEW.sub_course)) > 0 THEN prefix := 'IS';
    ELSIF position('CS' IN UPPER(NEW.sub_course)) > 0 THEN prefix := 'CS';
    ELSE prefix := 'GE'; 
    END IF;
    
    NEW.sub_miscode := prefix || NEW.sub_id::text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sub_before_insert
    BEFORE INSERT ON subject_table
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_sub_miscode();

-- 4.3 Student ID Generator
CREATE OR REPLACE FUNCTION fn_generate_stud_id()
RETURNS TRIGGER AS $$
DECLARE
    yr INTEGER;
    seqnum INTEGER;
BEGIN
    IF NEW.stud_id IS NOT NULL THEN RETURN NEW; END IF;
    
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

-- 4.4 Helper: Check if student can evaluate
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

-- 4.5 Helper: Get evaluable instructors
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

-- FACE RECOGNITION CRUD FUNCTIONS (AWS-Ready)
CREATE OR REPLACE FUNCTION instructor_face_create(
    p_ins_id BIGINT,
    p_aws_face_id TEXT, -- Changed from p_face_uuid
    p_created_by TEXT
) RETURNS instructor_face AS $$
DECLARE
_f instructor_face%ROWTYPE;
BEGIN
    -- Removed p_face_image_url, which was an error in the original schema
INSERT INTO instructor_face(ins_id, aws_face_id, created_by)
VALUES (p_ins_id, p_aws_face_id, p_created_by)
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

-- Renamed from read_by_uuid to read_by_aws_id
CREATE OR REPLACE FUNCTION instructor_face_read_by_aws_id(p_aws_face_id TEXT) RETURNS instructor_face AS $$
DECLARE _f instructor_face%ROWTYPE;
BEGIN
SELECT * INTO _f FROM instructor_face WHERE aws_face_id = p_aws_face_id;
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


-- =====================================================
-- 5. DATA INSERTION (EXPANDED DATASET)
-- =====================================================

-- 5.1 Admins & Moderators
INSERT INTO admin_table (admin_code, admin_username, admin_password, admin_fname, admin_mname, admin_lname, created_by) VALUES
('ADM001', 'superadmin', 'admin123', 'Zeus', 'O', 'Admin', 'System'),
('ADM002', 'ithead', 'securepass', 'Hera', 'Q', 'Manager', 'System');

INSERT INTO moderator (mod_username, mod_password, mod_fname, mod_mname, mod_lname, created_by) VALUES
('mod_john', 'modpass1', 'John', 'D', 'Doe', 'ADM001'),
('mod_jane', 'modpass2', 'Jane', 'E', 'Smith', 'ADM001'),
('mod_max', 'modpass3', 'Max', 'Power', 'Steel', 'ADM002');

-- 5.2 Instructors (20 Entries covering multiple depts)
INSERT INTO instructor (ins_fname, ins_mname, ins_lname, ins_suffix, ins_dob, ins_sex, ins_email, ins_contact, ins_dept) VALUES
-- BSIT Dept
('Michael', 'J', 'Smith', 'JR.', '1980-05-15', 'Male', 'msmith@univ.edu', '09171234567', 'BSIT'),
('Emily', 'R', 'Brown', '', '1990-03-12', 'Female', 'ebrown@univ.edu', '09171234570', 'BSIT'),
('William', 'B', 'Wilson', '', '1975-01-20', 'Male', 'wwilson@univ.edu', '09171234573', 'BSIT'),
('James', 'K', 'Anderson', '', '1988-06-14', 'Male', 'janderson@univ.edu', '09171234580', 'BSIT'),
('Patricia', 'L', 'Thomas', '', '1985-09-30', 'Female', 'pthomas@univ.edu', '09171234581', 'BSIT'),
('Robert', 'M', 'Jackson', '', '1982-11-11', 'Male', 'rjackson@univ.edu', '09171234582', 'BSIT'),
-- BSIS Dept
('Sarah', 'L', 'Johnson', '', '1985-08-22', 'Female', 'sjohnson@univ.edu', '09171234568', 'BSIS'),
('Jessica', 'M', 'Miller', '', '1988-11-05', 'Female', 'jmiller@univ.edu', '09171234572', 'BSIS'),
('Christopher', 'N', 'White', '', '1979-02-28', 'Male', 'cwhite@univ.edu', '09171234583', 'BSIS'),
('Elizabeth', 'O', 'Harris', '', '1992-07-19', 'Female', 'eharris@univ.edu', '09171234584', 'BSIS'),
-- BSCS Dept
('David', 'K', 'Williams', '', '1978-12-10', 'Male', 'dwilliams@univ.edu', '09171234569', 'BSCS'),
('Robert', 'T', 'Davis', 'III', '1982-07-30', 'Male', 'rdavis@univ.edu', '09171234571', 'BSCS'),
('Linda', 'C', 'Moore', '', '1992-09-14', 'Female', 'lmoore@univ.edu', '09171234574', 'BSCS'),
('Richard', 'P', 'Martin', '', '1980-04-05', 'Male', 'rmartin@univ.edu', '09171234585', 'BSCS'),
('Susan', 'Q', 'Thompson', '', '1987-12-22', 'Female', 'sthompson@univ.edu', '09171234586', 'BSCS'),
('Joseph', 'R', 'Garcia', '', '1991-08-15', 'Male', 'jgarcia@univ.edu', '09171234587', 'BSCS'),
-- Gen Ed / Other
('Margaret', 'S', 'Martinez', '', '1976-10-01', 'Female', 'mmartinez@univ.edu', '09171234588', 'GEN'),
('Charles', 'T', 'Robinson', '', '1983-05-20', 'Male', 'crobinson@univ.edu', '09171234589', 'GEN'),
('Karen', 'U', 'Clark', '', '1989-01-30', 'Female', 'kclark@univ.edu', '09171234590', 'GEN'),
('Thomas', 'V', 'Rodriguez', '', '1984-03-17', 'Male', 'trodriguez@univ.edu', '09171234591', 'GEN');

-- 5.3 Subjects (25 Entries covering 1st-4th year)
INSERT INTO subject_table (sub_name, sub_semester, sub_year, sub_course, sub_units) VALUES
-- 1st Year
('Intro to Computing', 1, 1, 'BSIT', 3),
('Programming I', 1, 1, 'BSIT', 4),
('Ethics in IT', 1, 1, 'GEN', 3),
('Discrete Mathematics', 1, 1, 'BSCS', 3),
('Purposive Communication', 1, 1, 'GEN', 3),
-- 2nd Year
('Database Systems', 1, 2, 'BSIT', 3),
('Web Development', 1, 2, 'BSIT', 3),
('Data Structures', 1, 2, 'BSCS', 4),
('Object Oriented Programming', 2, 2, 'BSIT', 3),
('Platform Technologies', 2, 2, 'BSIS', 3),
('Human Computer Interaction', 2, 2, 'BSIT', 3),
-- 3rd Year
('Systems Analysis', 1, 3, 'BSIS', 3),
('Software Engineering', 1, 3, 'BSCS', 3),
('Mobile App Development', 1, 3, 'BSIT', 3),
('Operating Systems', 2, 3, 'BSCS', 3),
('Networking I', 2, 3, 'BSIT', 3),
('Technopreneurship', 2, 3, 'BSIT', 3),
-- 4th Year
('Network Security', 1, 4, 'BSIT', 3),
('Cloud Computing', 1, 4, 'BSIT', 3),
('Artificial Intelligence', 1, 4, 'BSCS', 3),
('Capstone Project I', 1, 4, 'BSIT', 3),
('Capstone Project II', 2, 4, 'BSIT', 3),
('IT Service Management', 2, 4, 'BSIS', 3),
('Data Mining', 2, 4, 'BSCS', 3),
('Professional Ethics', 2, 4, 'GEN', 3);

-- 5.4 Sections (15 Entries covering all years/courses)
INSERT INTO section_table (sect_semester, sect_name, sect_year_level, sect_school_year, sect_course) VALUES
-- BSIT Sections
(1, 'BSIT-1A', 1, '2025-2026', 'BSIT'),
(1, 'BSIT-1B', 1, '2025-2026', 'BSIT'),
(1, 'BSIT-2A', 2, '2025-2026', 'BSIT'),
(1, 'BSIT-2B', 2, '2025-2026', 'BSIT'),
(1, 'BSIT-3A', 3, '2025-2026', 'BSIT'),
(1, 'BSIT-3B', 3, '2025-2026', 'BSIT'),
(1, 'BSIT-4A', 4, '2025-2026', 'BSIT'),
(1, 'BSIT-4B', 4, '2025-2026', 'BSIT'),
-- BSCS Sections
(1, 'BSCS-1A', 1, '2025-2026', 'BSCS'),
(1, 'BSCS-2A', 2, '2025-2026', 'BSCS'),
(1, 'BSCS-3A', 3, '2025-2026', 'BSCS'),
(1, 'BSCS-4A', 4, '2025-2026', 'BSCS'),
-- BSIS Sections
(1, 'BSIS-1A', 1, '2025-2026', 'BSIS'),
(1, 'BSIS-2A', 2, '2025-2026', 'BSIS'),
(1, 'BSIS-3A', 3, '2025-2026', 'BSIS');

-- 5.5 Students (120+ Samples distributed across new sections)
INSERT INTO student (stud_fname, stud_mname, stud_lname, stud_suffix, stud_dob, stud_sex, stud_course, stud_year, stud_section, stud_semester) VALUES
-- BSIT 1A (Freshmen)
('Liam', 'A', 'Garcia', '', '2003-01-10', 'Male', 'BSIT', 1, 'BSIT-1A', 1),
('Noah', 'B', 'Rodriguez', '', '2003-02-15', 'Male', 'BSIT', 1, 'BSIT-1A', 1),
('Ava', 'L', 'Jackson', '', '2003-12-05', 'Female', 'BSIT', 1, 'BSIT-1A', 1),
('Evelyn', 'R', 'Harris', '', '2003-06-04', 'Female', 'BSIT', 1, 'BSIT-1A', 1),
('James', 'X', 'Carter', '', '2003-01-20', 'Male', 'BSIT', 1, 'BSIT-1A', 1),
('Logan', 'Y', 'Mitchell', '', '2003-02-25', 'Male', 'BSIT', 1, 'BSIT-1A', 1),
('Mason', 'Z', 'Perez', '', '2003-03-15', 'Male', 'BSIT', 1, 'BSIT-1A', 1),
('Ethan', 'A', 'Roberts', '', '2003-04-10', 'Male', 'BSIT', 1, 'BSIT-1A', 1),
('Lucas', 'B', 'Turner', '', '2003-05-05', 'Male', 'BSIT', 1, 'BSIT-1A', 1),
('Jacob', 'C', 'Phillips', '', '2003-06-01', 'Male', 'BSIT', 1, 'BSIT-1A', 1),

-- BSIT 1B
('Michael', 'D', 'Campbell', '', '2003-07-12', 'Male', 'BSIT', 1, 'BSIT-1B', 1),
('Daniel', 'E', 'Parker', '', '2003-08-22', 'Male', 'BSIT', 1, 'BSIT-1B', 1),
('Matthew', 'F', 'Evans', '', '2003-09-30', 'Male', 'BSIT', 1, 'BSIT-1B', 1),
('Aiden', 'G', 'Edwards', '', '2003-10-18', 'Male', 'BSIT', 1, 'BSIT-1B', 1),
('Joseph', 'H', 'Collins', '', '2003-11-25', 'Male', 'BSIT', 1, 'BSIT-1B', 1),
('Samuel', 'I', 'Stewart', '', '2003-12-14', 'Male', 'BSIT', 1, 'BSIT-1B', 1),
('David', 'J', 'Sanchez', '', '2004-01-05', 'Male', 'BSIT', 1, 'BSIT-1B', 1),
('Sebastian', 'K', 'Morris', '', '2004-02-11', 'Male', 'BSIT', 1, 'BSIT-1B', 1),
('Jack', 'L', 'Rogers', '', '2004-03-20', 'Male', 'BSIT', 1, 'BSIT-1B', 1),
('Owen', 'M', 'Reed', '', '2004-04-15', 'Male', 'BSIT', 1, 'BSIT-1B', 1),

-- BSIT 2A
('Oliver', 'C', 'Martinez', '', '2003-03-20', 'Male', 'BSIT', 2, 'BSIT-2A', 1),
('Elijah', 'D', 'Hernandez', '', '2003-04-25', 'Male', 'BSIT', 2, 'BSIT-2A', 1),
('Charlotte', 'M', 'Martin', '', '2003-01-10', 'Female', 'BSIT', 2, 'BSIT-2A', 1),
('Harper', 'S', 'Sanchez', '', '2003-07-09', 'Female', 'BSIT', 2, 'BSIT-2A', 1),
('Mia', 'N', 'Cook', '', '2003-05-15', 'Female', 'BSIT', 2, 'BSIT-2A', 1),
('Amelia', 'O', 'Morgan', '', '2003-06-20', 'Female', 'BSIT', 2, 'BSIT-2A', 1),
('Sofia', 'P', 'Bell', '', '2003-07-25', 'Female', 'BSIT', 2, 'BSIT-2A', 1),
('Camila', 'Q', 'Murphy', '', '2003-08-30', 'Female', 'BSIT', 2, 'BSIT-2A', 1),
('Aria', 'R', 'Bailey', '', '2003-09-05', 'Female', 'BSIT', 2, 'BSIT-2A', 1),
('Scarlett', 'S', 'Rivera', '', '2003-10-10', 'Female', 'BSIT', 2, 'BSIT-2A', 1),

-- BSIT 2B
('Victoria', 'T', 'Cooper', '', '2003-11-15', 'Female', 'BSIT', 2, 'BSIT-2B', 1),
('Madison', 'U', 'Richardson', '', '2003-12-20', 'Female', 'BSIT', 2, 'BSIT-2B', 1),
('Luna', 'V', 'Cox', '', '2004-01-25', 'Female', 'BSIT', 2, 'BSIT-2B', 1),
('Grace', 'W', 'Howard', '', '2004-02-28', 'Female', 'BSIT', 2, 'BSIT-2B', 1),
('Chloe', 'X', 'Ward', '', '2004-03-05', 'Female', 'BSIT', 2, 'BSIT-2B', 1),
('Penelope', 'Y', 'Torres', '', '2004-04-10', 'Female', 'BSIT', 2, 'BSIT-2B', 1),
('Layla', 'Z', 'Peterson', '', '2004-05-15', 'Female', 'BSIT', 2, 'BSIT-2B', 1),
('Riley', 'A', 'Gray', '', '2004-06-20', 'Female', 'BSIT', 2, 'BSIT-2B', 1),
('Zoey', 'B', 'Ramirez', '', '2004-07-25', 'Female', 'BSIT', 2, 'BSIT-2B', 1),
('Nora', 'C', 'James', '', '2004-08-30', 'Female', 'BSIT', 2, 'BSIT-2B', 1),

-- BSIT 3A
('James', 'E', 'Lopez', '', '2002-05-30', 'Male', 'BSIT', 3, 'BSIT-3A', 1),
('William', 'F', 'Gonzalez', '', '2002-06-05', 'Male', 'BSIT', 3, 'BSIT-3A', 1),
('Sophia', 'N', 'Lee', '', '2002-02-15', 'Female', 'BSIT', 3, 'BSIT-3A', 1),
('Luna', 'T', 'Clark', '', '2002-08-14', 'Female', 'BSIT', 3, 'BSIT-3A', 1),
('Lily', 'D', 'Watson', '', '2002-01-10', 'Female', 'BSIT', 3, 'BSIT-3A', 1),
('Eleanor', 'E', 'Brooks', '', '2002-02-15', 'Female', 'BSIT', 3, 'BSIT-3A', 1),
('Hannah', 'F', 'Kelly', '', '2002-03-20', 'Female', 'BSIT', 3, 'BSIT-3A', 1),
('Lillian', 'G', 'Sanders', '', '2002-04-25', 'Female', 'BSIT', 3, 'BSIT-3A', 1),
('Addison', 'H', 'Price', '', '2002-05-30', 'Female', 'BSIT', 3, 'BSIT-3A', 1),
('Aubrey', 'I', 'Bennett', '', '2002-06-05', 'Female', 'BSIT', 3, 'BSIT-3A', 1),

-- BSIT 3B
('Ellie', 'J', 'Wood', '', '2002-07-10', 'Female', 'BSIT', 3, 'BSIT-3B', 1),
('Stella', 'K', 'Barnes', '', '2002-08-15', 'Female', 'BSIT', 3, 'BSIT-3B', 1),
('Natalie', 'L', 'Ross', '', '2002-09-20', 'Female', 'BSIT', 3, 'BSIT-3B', 1),
('Zoe', 'M', 'Henderson', '', '2002-10-25', 'Female', 'BSIT', 3, 'BSIT-3B', 1),
('Leah', 'N', 'Coleman', '', '2002-11-30', 'Female', 'BSIT', 3, 'BSIT-3B', 1),
('Hazel', 'O', 'Jenkins', '', '2002-12-05', 'Female', 'BSIT', 3, 'BSIT-3B', 1),
('Violet', 'P', 'Perry', '', '2003-01-10', 'Female', 'BSIT', 3, 'BSIT-3B', 1),
('Aurora', 'Q', 'Powell', '', '2003-02-15', 'Female', 'BSIT', 3, 'BSIT-3B', 1),
('Savannah', 'R', 'Long', '', '2003-03-20', 'Female', 'BSIT', 3, 'BSIT-3B', 1),
('Audrey', 'S', 'Patterson', '', '2003-04-25', 'Female', 'BSIT', 3, 'BSIT-3B', 1),

-- BSIS 3A
('Benjamin', 'G', 'Wilson', '', '2001-07-10', 'Male', 'BSIS', 3, 'BSIS-3A', 1),
('Lucas', 'H', 'Anderson', '', '2001-08-15', 'Male', 'BSIS', 3, 'BSIS-3A', 1),
('Amelia', 'O', 'Perez', '', '2001-03-20', 'Female', 'BSIS', 3, 'BSIS-3A', 1),
('Wyatt', 'T', 'Hughes', '', '2001-01-05', 'Male', 'BSIS', 3, 'BSIS-3A', 1),
('Carter', 'U', 'Flores', '', '2001-02-10', 'Male', 'BSIS', 3, 'BSIS-3A', 1),
('Julian', 'V', 'Washington', '', '2001-03-15', 'Male', 'BSIS', 3, 'BSIS-3A', 1),
('Grayson', 'W', 'Butler', '', '2001-04-20', 'Male', 'BSIS', 3, 'BSIS-3A', 1),
('Leo', 'X', 'Simmons', '', '2001-05-25', 'Male', 'BSIS', 3, 'BSIS-3A', 1),
('Jayden', 'Y', 'Foster', '', '2001-06-30', 'Male', 'BSIS', 3, 'BSIS-3A', 1),
('Gabriel', 'Z', 'Gonzales', '', '2001-07-05', 'Male', 'BSIS', 3, 'BSIS-3A', 1),

-- BSCS 2A
('Isaac', 'A', 'Bryant', '', '2001-08-10', 'Male', 'BSCS', 2, 'BSCS-2A', 1),
('Lincoln', 'B', 'Alexander', '', '2001-09-15', 'Male', 'BSCS', 2, 'BSCS-2A', 1),
('Anthony', 'C', 'Russell', '', '2001-10-20', 'Male', 'BSCS', 2, 'BSCS-2A', 1),
('Hudson', 'D', 'Griffin', '', '2001-11-25', 'Male', 'BSCS', 2, 'BSCS-2A', 1),
('Dylan', 'E', 'Diaz', '', '2001-12-30', 'Male', 'BSCS', 2, 'BSCS-2A', 1),
('Ezra', 'F', 'Hayes', '', '2002-01-05', 'Male', 'BSCS', 2, 'BSCS-2A', 1),
('Thomas', 'G', 'Myers', '', '2002-02-10', 'Male', 'BSCS', 2, 'BSCS-2A', 1),
('Charles', 'H', 'Ford', '', '2002-03-15', 'Male', 'BSCS', 2, 'BSCS-2A', 1),
('Christopher', 'I', 'Hamilton', '', '2002-04-20', 'Male', 'BSCS', 2, 'BSCS-2A', 1),
('Jaxon', 'J', 'Graham', '', '2002-05-25', 'Male', 'BSCS', 2, 'BSCS-2A', 1),

-- BSCS 4A (Seniors)
('Henry', 'I', 'Thomas', '', '2002-09-20', 'Male', 'BSCS', 4, 'BSCS-4A', 1),
('Alexander', 'J', 'Taylor', '', '2002-10-25', 'Male', 'BSCS', 4, 'BSCS-4A', 1),
('Isabella', 'P', 'Thompson', '', '2002-04-25', 'Female', 'BSCS', 4, 'BSCS-4A', 1),
('Maverick', 'K', 'Sullivan', '', '2002-06-01', 'Male', 'BSCS', 4, 'BSCS-4A', 1),
('Josiah', 'L', 'Wallace', '', '2002-07-05', 'Male', 'BSCS', 4, 'BSCS-4A', 1),
('Isaiah', 'M', 'Woods', '', '2002-08-10', 'Male', 'BSCS', 4, 'BSCS-4A', 1),
('Andrew', 'N', 'Cole', '', '2002-09-15', 'Male', 'BSCS', 4, 'BSCS-4A', 1),
('Elias', 'O', 'West', '', '2002-10-20', 'Male', 'BSCS', 4, 'BSCS-4A', 1),
('Joshua', 'P', 'Jordan', '', '2002-11-25', 'Male', 'BSCS', 4, 'BSCS-4A', 1),
('Nathan', 'Q', 'Owens', '', '2002-12-30', 'Male', 'BSCS', 4, 'BSCS-4A', 1),

-- BSIT 4A (Seniors)
('Emma', 'K', 'Moore', '', '2000-11-30', 'Female', 'BSIT', 4, 'BSIT-4A', 1),
('Mia', 'Q', 'White', '', '2000-05-30', 'Female', 'BSIT', 4, 'BSIT-4A', 1),
('Colton', 'B', 'Murray', '', '2000-01-10', 'Male', 'BSIT', 4, 'BSIT-4A', 1),
('Luca', 'C', 'Freeman', '', '2000-02-15', 'Male', 'BSIT', 4, 'BSIT-4A', 1),
('Landon', 'D', 'Wells', '', '2000-03-20', 'Male', 'BSIT', 4, 'BSIT-4A', 1),
('Hunter', 'E', 'Webb', '', '2000-04-25', 'Male', 'BSIT', 4, 'BSIT-4A', 1),
('Jonathan', 'F', 'Simpson', '', '2000-05-30', 'Male', 'BSIT', 4, 'BSIT-4A', 1),
('Santiago', 'G', 'Stevens', '', '2000-06-05', 'Male', 'BSIT', 4, 'BSIT-4A', 1),
('Axel', 'H', 'Tucker', '', '2000-07-10', 'Male', 'BSIT', 4, 'BSIT-4A', 1),
('Easton', 'I', 'Porter', '', '2000-08-15', 'Male', 'BSIT', 4, 'BSIT-4A', 1),

-- BSIT 4B
('Cooper', 'J', 'Hunter', '', '2000-09-20', 'Male', 'BSIT', 4, 'BSIT-4B', 1),
('Jeremiah', 'K', 'Hicks', '', '2000-10-25', 'Male', 'BSIT', 4, 'BSIT-4B', 1),
('Angel', 'L', 'Crawford', '', '2000-11-30', 'Male', 'BSIT', 4, 'BSIT-4B', 1),
('Roman', 'M', 'Henry', '', '2000-12-05', 'Male', 'BSIT', 4, 'BSIT-4B', 1),
('Connor', 'N', 'Boyd', '', '2001-01-10', 'Male', 'BSIT', 4, 'BSIT-4B', 1),
('Jameson', 'O', 'Mason', '', '2001-02-15', 'Male', 'BSIT', 4, 'BSIT-4B', 1),
('Robert', 'P', 'Morales', '', '2001-03-20', 'Male', 'BSIT', 4, 'BSIT-4B', 1),
('Greyson', 'Q', 'Kennedy', '', '2001-04-25', 'Male', 'BSIT', 4, 'BSIT-4B', 1),
('Jordan', 'R', 'Warren', '', '2001-05-30', 'Male', 'BSIT', 4, 'BSIT-4B', 1),
('Nicholas', 'S', 'Dixon', '', '2001-06-05', 'Male', 'BSIT', 4, 'BSIT-4B', 1);


-- =====================================================
-- 6. COMPLEX RELATIONSHIPS (DYNAMIC SCHEDULING LOGIC)
-- =====================================================
DO $$
DECLARE
    -- Records for iteration
    r_ins RECORD;
    r_sub RECORD;
    r_sect RECORD;
    r_student RECORD;
    r_enrollment RECORD;
    
    -- IDs
    v_ins_id BIGINT;
    v_sub_id INTEGER;
    v_sec_id INTEGER;
    v_insub_id INTEGER;
    v_total_ratings NUMERIC;
    
    -- Helpers
    v_c1 NUMERIC; v_c2 NUMERIC; v_c3 NUMERIC; v_c4 NUMERIC; v_c5 NUMERIC; v_total NUMERIC;
    v_remark TEXT;
    v_random_val NUMERIC;
BEGIN
    -- 6.1 ASSIGN SUBJECTS TO INSTRUCTORS (Logic: Match Dept or GenEd)
    FOR r_sub IN SELECT * FROM subject_table LOOP
        SELECT ins_id INTO v_ins_id 
        FROM instructor 
        WHERE ins_dept = r_sub.sub_course OR (r_sub.sub_course = 'GEN' AND ins_dept = 'GEN')
        ORDER BY random() 
        LIMIT 1;
        
        IF v_ins_id IS NULL THEN
             SELECT ins_id INTO v_ins_id FROM instructor ORDER BY random() LIMIT 1;
        END IF;

        IF v_ins_id IS NOT NULL THEN
            INSERT INTO instructor_subject (ins_id, sub_id) 
            VALUES (v_ins_id, r_sub.sub_id)
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    -- 6.2 CREATE CLASS SCHEDULES
    FOR r_sect IN SELECT * FROM section_table LOOP
        FOR r_sub IN SELECT * FROM subject_table WHERE sub_course = r_sect.sect_course AND sub_year = r_sect.sect_year_level LOOP
            SELECT insub_id INTO v_insub_id 
            FROM instructor_subject 
            WHERE sub_id = r_sub.sub_id 
            ORDER BY random() 
            LIMIT 1;
            
            IF v_insub_id IS NOT NULL THEN
                INSERT INTO section_subject_instructor (section_id, insub_id)
                VALUES (r_sect.section_id, v_insub_id)
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
        
        IF r_sect.sect_year_level = 1 THEN
            FOR r_sub IN SELECT * FROM subject_table WHERE sub_course = 'GEN' LOOP
                SELECT insub_id INTO v_insub_id FROM instructor_subject WHERE sub_id = r_sub.sub_id ORDER BY random() LIMIT 1;
                IF v_insub_id IS NOT NULL THEN
                    INSERT INTO section_subject_instructor (section_id, insub_id) VALUES (r_sect.section_id, v_insub_id) ON CONFLICT DO NOTHING;
                END IF;
            END LOOP;
        END IF;
    END LOOP;

    -- 6.3 ENROLL STUDENTS
    FOR r_student IN SELECT stud_id, stud_section FROM student LOOP
        SELECT section_id INTO v_sec_id FROM section_table WHERE sect_name = r_student.stud_section;
        
        IF v_sec_id IS NOT NULL THEN
            INSERT INTO student_section (section_id, stud_id) VALUES (v_sec_id, r_student.stud_id) ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;

    -- 6.4 AUTO-GENERATE EVALUATIONS (With Context-Aware Remarks)
    FOR r_enrollment IN 
        SELECT ss.stud_id, ss.section_id, ssi.insub_id 
        FROM student_section ss
        JOIN section_subject_instructor ssi ON ss.section_id = ssi.section_id
    LOOP
        -- 75% chance to evaluate each subject
        IF (random() < 0.75) THEN
            SELECT sub_id, ins_id INTO v_sub_id, v_ins_id FROM instructor_subject WHERE insub_id = r_enrollment.insub_id;
            
            IF NOT EXISTS (SELECT 1 FROM evaluation WHERE stud_id = r_enrollment.stud_id AND ins_id = v_ins_id AND sub_id = v_sub_id) THEN
                
                -- Determine Sentiment (Bad/Neutral/Good)
                v_random_val := random();
                
                IF v_random_val < 0.10 THEN 
                    -- BAD (10%)
                    v_c1 := floor(random() * 2 + 1)::numeric;
                    v_c2 := floor(random() * 2 + 1)::numeric;
                    v_c3 := floor(random() * 2 + 1)::numeric;
                    v_c4 := floor(random() * 2 + 1)::numeric;
                    v_c5 := floor(random() * 2 + 1)::numeric;
                    
                    v_remark := (ARRAY[
                        'Instructor is often late.',
                        'Lectures are confusing.',
                        'Needs to improve teaching style.',
                        'Very strict and unapproachable.',
                        'Hard to understand lessons.'
                    ])[floor(random() * 5 + 1)];

                ELSIF v_random_val < 0.40 THEN 
                    -- NEUTRAL (30%)
                    v_c1 := floor(random() * 2 + 2)::numeric; -- 2 or 3
                    v_c2 := floor(random() * 2 + 2)::numeric;
                    v_c3 := floor(random() * 2 + 2)::numeric;
                    v_c4 := floor(random() * 2 + 2)::numeric;
                    v_c5 := floor(random() * 2 + 2)::numeric;

                    v_remark := (ARRAY[
                        'Average teaching performance.',
                        'Class is okay but could be more engaging.',
                        'Acceptable, but strictly follows the book.',
                        'Fair grading system.',
                        'Lectures are decent enough.'
                    ])[floor(random() * 5 + 1)];

                ELSE 
                    -- GOOD (60%)
                    v_c1 := floor(random() * 2 + 4)::numeric; -- 4 or 5
                    v_c2 := floor(random() * 2 + 4)::numeric;
                    v_c3 := floor(random() * 2 + 4)::numeric;
                    v_c4 := floor(random() * 2 + 4)::numeric;
                    v_c5 := floor(random() * 2 + 4)::numeric;

                    v_remark := (ARRAY[
                        'Excellent instructor!',
                        'Explains concepts very clearly.',
                        'Very approachable and kind.',
                        'Best teacher I have had so far.',
                        'Makes learning fun and easy.'
                    ])[floor(random() * 5 + 1)];
                END IF;

                v_total := (v_c1 + v_c2 + v_c3 + v_c4 + v_c5) / 5.0;
                
                INSERT INTO evaluation (ev_subject, ev_semester, ev_C1, ev_C2, ev_C3, ev_C4, ev_C5, ev_total_rating, ev_remark, sub_id, stud_id, ins_id)
                VALUES (
                    (SELECT sub_name FROM subject_table WHERE sub_id = v_sub_id),
                    1, 
                    v_c1, v_c2, v_c3, v_c4, v_c5, v_total,
                    v_remark,
                    v_sub_id, r_enrollment.stud_id, v_ins_id
                );
            END IF;
        END IF;
    END LOOP;

    -- 6.5 Add Log
    INSERT INTO log_table (mod_id, ins_id, log_action) 
    VALUES ((SELECT mod_id FROM moderator LIMIT 1), NULL, 'System Initialization: Batch Data Loaded');

END $$;

-- =====================================================
-- 7. COMMIT & VERIFY
-- =====================================================
COMMIT;

-- Verification Output
SELECT '=== DATABASE SETUP COMPLETE ===' as status;
SELECT 'Students Created: ' || COUNT(*) FROM student;
SELECT 'Instructors Created: ' || COUNT(*) FROM instructor;
SELECT 'Subjects Created: ' || COUNT(*) FROM subject_table;
SELECT 'Sections Created: ' || COUNT(*) FROM section_table;
SELECT 'Classes Scheduled: ' || COUNT(*) FROM section_subject_instructor;
SELECT 'Evaluations Generated: ' || COUNT(*) FROM evaluation;