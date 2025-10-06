-- Create table
CREATE TABLE students (
    st_studID      INT PRIMARY KEY,
    st_fname       VARCHAR(50) NOT NULL,
    st_mname       VARCHAR(50),
    st_lname       VARCHAR(50) NOT NULL,
    st_suffix      VARCHAR(10),
    st_dob         DATE NOT NULL,
    st_sex         VARCHAR(10) CHECK (st_sex IN ('Male', 'Female')),
    st_course      VARCHAR(10) NOT NULL,
    st_year        INT CHECK (st_year >= 1 AND st_year <= 5),
    st_section     VARCHAR(5) NOT NULL,
    st_semester    INT CHECK (st_semester IN (1, 2)),
	section_id INT REFERENCES sections(section_id)  -- Foreign key
);


-- Insert sample data
INSERT INTO students (st_studID, st_fname, st_mname, st_lname, st_suffix, st_dob, st_sex, st_course, st_year, st_section, st_semester) VALUES
(20210001, 'Alice', 'Marie', 'Johnson', '', '2002-05-14', 'Female', 'BSIT', 2, 'A', 1, 2001),
(20210002, 'John Paul', 'Panggo', 'Mahilom', '', '2005-06-24', 'Male', 'BSIT', 3, 'B', 1, 3002),
(20210003, 'Cassandra', 'Rose', 'Lee', 'Ma.', '2001-12-03', 'Female', 'BSIT', 4, 'A', 1, 4001),
(20210005, 'Sophia', 'Anne', 'Cruz', '', '2004-09-12', 'Female', 'BSIS', 4, 'A', 1, 4001),
(1348317, 'Joehanes', 'Polestico', 'Lauglaug', '', '2005-02-21', 'Male', 'BSIT', 3, 'A', 1, 3001),
(20210008, 'Rhea', 'Jane', 'Lim', '', '2003-08-10', 'Female', 'BSIT', 3, 'B', 1, 3002),
(20210009, 'Mark', 'Anthony', 'Perez', '', '2002-01-25', 'Male', 'BSIT', 3, 'A', 1, 3001);



-- Create table
CREATE TABLE instructors (
    in_instructorID INT PRIMARY KEY,
    in_fname        VARCHAR(50) NOT NULL,
    in_mname        VARCHAR(50),
    in_lname        VARCHAR(50) NOT NULL,
    in_suffix       VARCHAR(10),
    in_dob          DATE NOT NULL,
    in_sex          CHAR(1) CHECK (in_sex IN ('M', 'F')),
    in_email        VARCHAR(100) UNIQUE NOT NULL,
    in_cnum         VARCHAR(20),
    in_dept         VARCHAR(10) NOT NULL,
    in_subhandled   TEXT[]
);

CREATE SEQUENCE seq_bsit START 1050001;
CREATE SEQUENCE seq_bsis START 1060001;

CREATE OR REPLACE FUNCTION set_instructor_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.in_dept = 'BSIT' THEN
        NEW.in_instructorID := nextval('seq_bsit');
    ELSIF NEW.in_dept = 'BSIS' THEN
        NEW.in_instructorID := nextval('seq_bsis');
    ELSE
        RAISE EXCEPTION 'Unknown department: %', NEW.in_dept;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_instructor_id
BEFORE INSERT ON instructors
FOR EACH ROW
EXECUTE FUNCTION set_instructor_id();



-- Insert sample data
INSERT INTO instructors 
(in_fname, in_mname, in_lname, in_suffix, in_dob, in_sex, in_email, in_cnum, in_dept, in_subhandled)
VALUES
('Michael', 'J.', 'Smith', 'Jr.', '1980-05-15', 'M', 'msmith@email.com', '0912-345-6789', 'BSIT', ARRAY['101','202','305']),
('David', 'B.', 'Lee', '', '1988-02-28', 'M', 'dlee@email.com', '0934-567-8901', 'BSIT', ARRAY['102','201','306']),
('Robert', 'D.', 'Perez', '', '1979-07-10', 'M', 'rperez@email.com', '0956-789-0123', 'BSIT', ARRAY['103','203','401']),
('James', 'F.', 'Cruz', '', '1972-12-01', 'M', 'jcruz@email.com', '0978-901-2345', 'BSIT', ARRAY['104','204','402']),
('Daniel', 'H.', 'Flores', '', '1983-08-07', 'M', 'dflores@email.com', '0901-234-5678', 'BSIT', ARRAY['105','205','403']),
('Gwapo', 'X.', 'Lawas', '', '1981-10-25', 'M', 'pogilawas@email.com', '0921-123-4567', 'BSIT', ARRAY['106','206','303']),
('Matthew', 'M.', 'Rodriguez', '', '1976-05-08', 'M', 'mrodriguez@email.com', '0943-345-6789', 'BSIT', ARRAY['107','207','405']),
('Kevin', 'O.', 'Martinez', '', '1987-09-02', 'M', 'kmartinez@email.com', '0965-567-8901', 'BSIT', ARRAY['108','208','406']),
('Brian', 'Q.', 'Johnson', '', '1989-03-14', 'M', 'bjohnson@email.com', '0987-789-0123', 'BSIT', ARRAY['301']),
('Steven', 'S.', 'Moore', '', '1970-12-31', 'M', 'smoore@email.com', '0909-901-2345', 'BSIT', ARRAY['302']),
('Mark', 'U.', 'Clark', '', '1986-07-05', 'M', 'mclark@email.com', '0921-123-4568', 'BSIT', ARRAY['404']),
('Jason', 'W.', 'Green', '', '1978-09-29', 'M', 'jgreen@email.com', '0943-345-6790', 'BSIT', ARRAY['304']),
('Gary', 'Y.', 'Baker', '', '1971-11-21', 'M', 'gbaker@email.com', '0965-567-8902', 'BSIT', ARRAY['305']),
('Eric', 'A.', 'Carter', '', '1985-03-10', 'M', 'ecarter@email.com', '0987-789-0124', 'BSIT', ARRAY['306']),
('Paul', 'C.', 'Hall', '', '1992-06-23', 'M', 'phall@email.com', '0909-901-2346', 'BSIT', ARRAY['401']),

('Jessica', 'A.', 'Jones', '', '1975-11-20', 'F', 'jjones@email.com', '0923-456-7890', 'BSIS', ARRAY['111']),
('Sarah', 'C.', 'Chen', '', '1991-09-03', 'F', 'schen@email.com', '0945-678-9012', 'BSIS', ARRAY['112']),
('Emily', 'E.', 'Gomez', '', '1985-04-22', 'F', 'egomez@email.com', '0967-890-1234', 'BSIS', ARRAY['113']),
('Olivia', 'G.', 'Reyes', '', '1990-06-18', 'F', 'oreyes@email.com', '0989-012-3456', 'BSIS', ARRAY['114']),
('Sophia', 'I.', 'Santos', '', '1977-03-30', 'F', 'ssantos@email.com', '0912-345-6780', 'BSIS', ARRAY['115']),
('Amanda', 'L.', 'Garcia', '', '1984-01-12', 'F', 'agarcia@email.com', '0932-234-5678', 'BSIS', ARRAY['121']),
('Laura', 'N.', 'Wilson', '', '1993-11-17', 'F', 'lwilson@email.com', '0954-456-7890', 'BSIS', ARRAY['122']),
('Linda', 'P.', 'Hernandez', '', '1974-06-25', 'F', 'lhernandez@email.com', '0976-678-9012', 'BSIS', ARRAY['123']),
('Nicole', 'R.', 'Patterson', '', '1982-08-19', 'F', 'npattersone@email.com', '0998-890-1234', 'BSIS', ARRAY['111']),
('Rachel', 'T.', 'Taylor', '', '1995-02-09', 'F', 'rtaylor@email.com', '0910-012-3456', 'BSIS', ARRAY['112']),
('Megan', 'V.', 'Hill', '', '1994-04-11', 'F', 'mhill@email.com', '0932-234-5679', 'BSIS', ARRAY['113']),
('Hannah', 'X.', 'Adams', '', '1983-02-06', 'F', 'hadams@email.com', '0954-456-7891', 'BSIS', ARRAY['114']),
('Rebecca', 'Z.', 'Nelson', '', '1990-08-01', 'F', 'rnelson@email.com', '0976-678-9013', 'BSIS', ARRAY['115']),
('Chloe', 'B.', 'Fisher', '', '1979-05-18', 'F', 'cfisher@email.com', '0998-890-1235', 'BSIS', ARRAY['121']),
('Samantha', 'D.', 'King', '', '1988-12-04', 'F', 'sking@email.com', '0910-012-3457', 'BSIS', ARRAY['122']);




-- Create the subjects table
CREATE TABLE subjects (
    sb_subid INT PRIMARY KEY,         -- Auto-generated ID like 101, 102, 201...
    sb_name VARCHAR(255) NOT NULL,    -- Subject name
    sb_miscode VARCHAR(20) NOT NULL,  -- MIS code like "IT101"
    sb_semester INT NOT NULL,         -- Semester number
    sb_year INT NOT NULL CHECK (sb_year BETWEEN 1 AND 5), -- Year level (1-5)
    sb_units INT NOT NULL,            -- Number of units
    sb_course VARCHAR(10) NOT NULL    -- Course (BSIT / BSIS)
);



-- Create sequences per year level
CREATE SEQUENCE year1_seq START 101;
CREATE SEQUENCE year2_seq START 201;
CREATE SEQUENCE year3_seq START 301;
CREATE SEQUENCE year4_seq START 401;
CREATE SEQUENCE year5_seq START 501;

-- Function to auto-generate sb_subid
CREATE OR REPLACE FUNCTION set_sb_subid()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sb_year = 1 THEN
        NEW.sb_subid := nextval('year1_seq');
    ELSIF NEW.sb_year = 2 THEN
        NEW.sb_subid := nextval('year2_seq');
    ELSIF NEW.sb_year = 3 THEN
        NEW.sb_subid := nextval('year3_seq');
    ELSIF NEW.sb_year = 4 THEN
        NEW.sb_subid := nextval('year4_seq');
    ELSIF NEW.sb_year = 5 THEN
        NEW.sb_subid := nextval('year5_seq');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER trg_set_sb_subid
BEFORE INSERT ON subjects
FOR EACH ROW
EXECUTE FUNCTION set_sb_subid();

SELECT * FROM subjects;

-- Year 1 (BSIT)
INSERT INTO subjects (sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course) VALUES
('Introduction to Computing', 'IT101', 1, 1, 3, 'BSIT'),
('Computer Programming 1', 'IT102', 1, 1, 3, 'BSIT'),
('Mathematics in the Modern World', 'GE103', 1, 1, 3, 'BSIT'),
('Reading and Writing', 'GE104', 1, 1, 3, 'BSIT'),
('Physical Education 1', 'PE105', 1, 1, 2, 'BSIT'),
('Purposive Communication', 'GE106', 2, 1, 3, 'BSIT'),
('Computer Programming 2', 'IT107', 2, 1, 3, 'BSIT'),
('Physical Education 2', 'PE108', 2, 1, 2, 'BSIT');

-- Year 2 (BSIT)
INSERT INTO subjects (sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course) VALUES
('Data Structures and Algorithms', 'IT201', 1, 2, 3, 'BSIT'),
('Information Management', 'IT202', 1, 2, 3, 'BSIT'),
('Professional Elective 1', 'IT203', 1, 2, 3, 'BSIT'),
('Object-Oriented Programming', 'IT204', 1, 2, 3, 'BSIT'),
('Networking 1', 'IT205', 2, 2, 3, 'BSIT'),
('The Contemporary World', 'GE206', 2, 2, 3, 'BSIT'),
('Science, Technology, and Society', 'GE207', 2, 2, 3, 'BSIT'),
('Physical Education 3', 'PE208', 2, 2, 2, 'BSIT');

-- Year 3 (BSIT)
INSERT INTO subjects (sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course) VALUES
('Integrative Programming and Technologies', 'IT301', 1, 3, 3, 'BSIT'),
('Information Assurance and Security', 'IT302', 1, 3, 3, 'BSIT'),
('Human-Computer Interaction', 'IT304', 1, 3, 3, 'BSIT'),
('The Life and Works of Rizal', 'GE304', 1, 3, 3, 'BSIT'),
('Systems Analysis and Design', 'IT305', 2, 3, 3, 'BSIT'),
('Application Development and Emerging Technologies', 'IT306', 2, 3, 3, 'BSIT'),
('IT Elective 1', 'IT307', 2, 3, 3, 'BSIT'),
('Physical Education 4', 'PE308', 2, 3, 2, 'BSIT');

-- Year 4 (BSIT)
INSERT INTO subjects (sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course) VALUES
('Systems Integration and Architecture', 'IT401', 1, 4, 3, 'BSIT'),
('System Administration and Maintenance', 'IT402', 1, 4, 3, 'BSIT'),
('Capstone Project 1', 'IT403', 1, 4, 3, 'BSIT'),
('On-the-Job Training', 'IT404', 2, 4, 6, 'BSIT'),
('Capstone Project 2', 'IT405', 2, 4, 3, 'BSIT'),
('IT Elective 2', 'IT406', 2, 4, 3, 'BSIT'),
('IT Elective 3', 'IT407', 2, 4, 3, 'BSIT'),
('IT Elective 4', 'IT408', 2, 4, 3, 'BSIT');

-- ==========================================================
-- Year 1 (BSIS)
INSERT INTO subjects (sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course) VALUES
('Fundamentals of Information Systems', 'IS111', 1, 1, 3, 'BSIS'),
('Computer Programming 1', 'IS112', 1, 1, 3, 'BSIS'),
('Organization and Management Concepts', 'IS113', 1, 1, 3, 'BSIS'),
('Business Process Management', 'IS114', 1, 1, 3, 'BSIS'),
('Physical Education 1', 'PE115', 1, 1, 2, 'BSIS'),
('Introduction to Accounting and Financial Management', 'IS121', 2, 1, 3, 'BSIS'),
('Computer Programming 2', 'IS122', 2, 1, 3, 'BSIS'),
('Discrete Mathematics', 'IS123', 2, 1, 3, 'BSIS');

-- Year 2 (BSIS)
INSERT INTO subjects (sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course) VALUES
('Systems Analysis and Design', 'IS211', 1, 2, 3, 'BSIS'),
('Database Management Systems', 'IS212', 1, 2, 3, 'BSIS'),
('Object-Oriented Programming', 'IS213', 1, 2, 3, 'BSIS'),
('IT Infrastructure and Networking Technologies', 'IS214', 1, 2, 3, 'BSIS'),
('Physical Education 2', 'PE215', 1, 2, 2, 'BSIS'),
('Web Application Development', 'IS221', 2, 2, 3, 'BSIS'),
('Quantitative Methods for Information Systems', 'IS222', 2, 2, 3, 'BSIS'),
('Project Management for Information Systems', 'IS223', 2, 2, 3, 'BSIS');

-- Year 3 (BSIS)
INSERT INTO subjects (sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course) VALUES
('Information Security and Risk Management', 'IS311', 1, 3, 3, 'BSIS'),
('Evaluation of Business Performance', 'IS312', 1, 3, 3, 'BSIS'),
('Business Intelligence and Data Analytics', 'IS313', 1, 3, 3, 'BSIS'),
('Physical Education 3', 'PE314', 1, 3, 2, 'BSIS'),
('Technopreneurship', 'IS321', 2, 3, 3, 'BSIS'),
('Enterprise Architecture', 'IS322', 2, 3, 3, 'BSIS'),
('IS Elective 1', 'IS323', 2, 3, 3, 'BSIS'),
('Research Methods for Information Systems', 'IS324', 2, 3, 3, 'BSIS');

-- Year 4 (BSIS)
INSERT INTO subjects (sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course) VALUES
('Strategic IT Management', 'IS411', 1, 4, 3, 'BSIS'),
('Capstone Project 1', 'IS412', 1, 4, 3, 'BSIS'),
('IT Audit and Assurance', 'IS413', 1, 4, 3, 'BSIS'),
('IS Elective 2', 'IS414', 1, 4, 3, 'BSIS'),
('Physical Education 4', 'PE415', 1, 4, 2, 'BSIS'),
('On-the-Job Training', 'IS421', 2, 4, 6, 'BSIS'),
('Capstone Project 2', 'IS422', 2, 4, 3, 'BSIS'),
('IS Elective 3', 'IS423', 2, 4, 3, 'BSIS');


CREATE TABLE sections (
    section_id INT PRIMARY KEY,        -- Class ID (ex: 1051, 2051, etc.)
    section_year INT NOT NULL,              -- Year level (1–4)
    section_name VARCHAR(5) NOT NULL,    -- Section (A, B, etc.)
    section_ins_list INT[] NOT NULL  -- Array of instructor IDs
);




CREATE TABLE evaluations (
    ev_id SERIAL PRIMARY KEY,            -- Evaluation ID (auto-increment)
    ev_code VARCHAR(20) NOT NULL,        -- Evaluation code (unique per evaluation, optional uniqueness)
    ev_subject INT NOT NULL,    -- Subject name/code
    ev_semester INT NOT NULL,            -- Semester (1 or 2)

    ev_C1 NUMERIC(2,1) CHECK (ev_C1 BETWEEN 1.0 AND 5.0),  -- Criterion 1 rating
    ev_C2 NUMERIC(2,1) CHECK (ev_C2 BETWEEN 1.0 AND 5.0),  -- Criterion 2 rating
    ev_C3 NUMERIC(2,1) CHECK (ev_C3 BETWEEN 1.0 AND 5.0),  -- Criterion 3 rating
    ev_C4 NUMERIC(2,1) CHECK (ev_C4 BETWEEN 1.0 AND 5.0),  -- Criterion 4 rating
    ev_C5 NUMERIC(2,1) CHECK (ev_C5 BETWEEN 1.0 AND 5.0),  -- Criterion 5 rating

    ev_total_rating NUMERIC(4,2),        -- Total/average rating
    ev_remark VARCHAR(255),              -- Remarks (e.g. Passed, Needs Improvement)

    st_studID BIGINT NOT NULL,           -- FK to students
    in_instructorID INT NOT NULL,              -- FK to instructors

    CONSTRAINT fk_student FOREIGN KEY (st_studID) REFERENCES students(st_studID) ON DELETE CASCADE,
    CONSTRAINT fk_instructor FOREIGN KEY (in_instructorID) REFERENCES instructors(in_instructorID) ON DELETE CASCADE
);






CREATE TABLE moderators (
    mod_ID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,  -- Auto-increment ID
    mod_username VARCHAR(50) UNIQUE NOT NULL,             -- Username (must be unique)
    mod_password VARCHAR(255) NOT NULL,                   -- Password (should be hashed in real apps)
    mod_fname VARCHAR(50) NOT NULL,                       -- First name
    mod_mname VARCHAR(50),                                -- Middle name (optional)
    mod_lname VARCHAR(50) NOT NULL,                       -- Last name
    date_created DATE DEFAULT CURRENT_DATE,               -- Date created
    created_by VARCHAR(50) NOT NULL                       -- Who created the account
);


INSERT INTO moderators 
(mod_username, mod_password, mod_fname, mod_mname, mod_lname, date_created, created_by) 
VALUES
('rexshimura', 'mod123', 'Rex', 'L', 'Zahard', '2024-05-20', 'ADMIN'),
('modtest', '1111', 'Test', 'T', 'Account', '2024-05-21', 'ADMIN');


CREATE TABLE moderator_logs (
    log_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,   -- Auto-increment Log ID
    mod_id INT NOT NULL,                                   -- FK: Moderator who performed the action
    log_action VARCHAR(50) NOT NULL,                       -- Action performed (e.g., 'Registered', 'Updated', 'Deleted')
    ins_id INT,                                             -- FK: Instructor ID affected (optional, can be NULL if action not related to instructor)
    log_date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Date & time of action

    CONSTRAINT fk_mod FOREIGN KEY (mod_id) REFERENCES moderators(mod_ID) ON DELETE CASCADE,
    CONSTRAINT fk_instructor FOREIGN KEY (ins_id) REFERENCES instructors(in_instructorID) ON DELETE SET NULL
);



