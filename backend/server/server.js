import express from "express";
import session from "express-session";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

// ------------------- Middleware -------------------
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: "my_super_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// ------------------- DB Connection -------------------
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "PROJ_HCI",
  password: "123",
  port: 5432,
});

// ------------------- Moderator Routes -------------------

// 👨‍💼 Get all moderators
app.get("/moderators", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT mod_id, mod_username, mod_fname, mod_mname, mod_lname, date_created, created_by FROM moderators ORDER BY mod_id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching moderators:", err);
    res.status(500).json({ error: "Failed to fetch moderators" });
  }
});

// 👨‍💼 Create new moderator
app.post("/moderators", async (req, res) => {
  try {
    const { mod_username, mod_password, mod_fname, mod_mname, mod_lname, created_by = "system" } = req.body;

    // Check if username already exists
    const existingUser = await pool.query(
      "SELECT mod_id FROM moderators WHERE mod_username = $1",
      [mod_username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const result = await pool.query(
      `INSERT INTO moderators 
        (mod_username, mod_password, mod_fname, mod_mname, mod_lname, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING mod_id, mod_username, mod_fname, mod_mname, mod_lname, date_created, created_by`,
      [mod_username, mod_password, mod_fname, mod_mname, mod_lname, created_by]
    );

    res.status(201).json({
      message: "Moderator created successfully",
      moderator: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating moderator:", err);
    res.status(500).json({ error: "Failed to create moderator" });
  }
});

// 👨‍💼 Update moderator
app.put("/moderators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { mod_fname, mod_mname, mod_lname, mod_password } = req.body;

    // Check if moderator exists
    const existingModerator = await pool.query(
      "SELECT mod_id FROM moderators WHERE mod_id = $1",
      [id]
    );

    if (existingModerator.rows.length === 0) {
      return res.status(404).json({ error: "Moderator not found" });
    }

    let query;
    let values;

    if (mod_password) {
      // Update with password
      query = `
        UPDATE moderators 
        SET mod_fname = $1, mod_mname = $2, mod_lname = $3, mod_password = $4
        WHERE mod_id = $5
        RETURNING mod_id, mod_username, mod_fname, mod_mname, mod_lname, date_created, created_by
      `;
      values = [mod_fname, mod_mname, mod_lname, mod_password, id];
    } else {
      // Update without password
      query = `
        UPDATE moderators 
        SET mod_fname = $1, mod_mname = $2, mod_lname = $3
        WHERE mod_id = $4
        RETURNING mod_id, mod_username, mod_fname, mod_mname, mod_lname, date_created, created_by
      `;
      values = [mod_fname, mod_mname, mod_lname, id];
    }

    const result = await pool.query(query, values);

    res.json({
      message: "Moderator updated successfully",
      moderator: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating moderator:", err);
    res.status(500).json({ error: "Failed to update moderator" });
  }
});

// 👨‍💼 Delete moderator
app.delete("/moderators/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if moderator exists
    const existingModerator = await pool.query(
      "SELECT mod_id FROM moderators WHERE mod_id = $1",
      [id]
    );

    if (existingModerator.rows.length === 0) {
      return res.status(404).json({ error: "Moderator not found" });
    }

    await pool.query("DELETE FROM moderators WHERE mod_id = $1", [id]);

    res.json({ message: "Moderator deleted successfully" });
  } catch (err) {
    console.error("Error deleting moderator:", err);
    res.status(500).json({ error: "Failed to delete moderator" });
  }
});

// 👨‍💼 Get single moderator by ID
app.get("/moderators/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT mod_id, mod_username, mod_fname, mod_mname, mod_lname, date_created, created_by FROM moderators WHERE mod_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Moderator not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching moderator:", err);
    res.status(500).json({ error: "Failed to fetch moderator" });
  }
});

// 📋 Get moderator logs
app.get("/moderator_logs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ml.*,
        i.in_fname,
        i.in_lname,
        i.in_dept
      FROM moderator_logs ml
      LEFT JOIN instructors i ON ml.ins_id = i.in_instructorid
      ORDER BY ml.log_date_created DESC
    `);
    
    if (result.rows.length === 0) {
      return res.json([]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching moderator logs:", err);
    res.status(500).json({ error: "Failed to fetch moderator logs" });
  }
});

// 🔑 Moderator login
app.post("/moderator_login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT mod_id, mod_username, mod_fname, mod_mname, mod_lname, date_created, created_by FROM moderators WHERE mod_username = $1 AND mod_password = $2",
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const moderator = result.rows[0];

    res.json({
      message: "Login successful",
      moderator,
    });
  } catch (err) {
    console.error("Moderator login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔑 Student login
app.post("/student_login", async (req, res) => {
  try {
    const { studentId, dob } = req.body;

    if (!studentId || !dob) {
      return res.status(400).json({ error: "Student ID and DOB are required" });
    }

    const result = await pool.query(
      "SELECT * FROM students WHERE st_studID = $1 AND st_dob = $2",
      [studentId, dob]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Invalid Student ID or Date of Birth" });
    }

    res.json({
      message: "Login successful",
      student: result.rows[0],
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 👨‍🏫 Instructors
app.get("/instructor_list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM instructors");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching instructors:", err);
    res.status(500).json({ error: "Failed to fetch instructors" });
  }
});

// 👨‍🏫 Create new instructor
app.post("/instructors", async (req, res) => {
  try {
    const { 
      in_fname, 
      in_mname, 
      in_lname, 
      in_suffix, 
      in_dob, 
      in_sex, 
      in_email, 
      in_cnum, 
      in_dept, 
      in_subhandled, // This should be an array of subject IDs like [101, 202, 303]
      moderator_id
    } = req.body;

    console.log('Received instructor data:', req.body);

    // Check if email already exists
    const existingInstructor = await pool.query(
      "SELECT in_instructorid FROM instructors WHERE in_email = $1",
      [in_email]
    );

    if (existingInstructor.rows.length > 0) {
      return res.status(400).json({ error: "Instructor with this email already exists" });
    }

    // Convert subject IDs to PostgreSQL array format if they're numbers
    let subhandledArray = in_subhandled;
    if (Array.isArray(in_subhandled) && in_subhandled.length > 0) {
      // Ensure all are strings (PostgreSQL TEXT[] expects strings)
      subhandledArray = in_subhandled.map(id => id.toString());
    }

    // The trigger will automatically set the instructor ID based on department
    const result = await pool.query(
      `INSERT INTO instructors 
        (in_fname, in_mname, in_lname, in_suffix, in_dob, in_sex, in_email, in_cnum, in_dept, in_subhandled) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [in_fname, in_mname, in_lname, in_suffix, in_dob, in_sex, in_email, in_cnum, in_dept, subhandledArray]
    );

    const newInstructor = result.rows[0];
    console.log('New instructor created:', newInstructor);

    // Log the action in moderator_logs if moderator_id is provided
    if (moderator_id) {
      await pool.query(
        `INSERT INTO moderator_logs (mod_id, log_action, ins_id) 
         VALUES ($1, $2, $3)`,
        [moderator_id, 'Registered', newInstructor.in_instructorid]
      );
      console.log('Moderator log created for moderator:', moderator_id);
    }

    res.status(201).json({
      message: "Instructor created successfully",
      instructor: newInstructor,
    });
  } catch (err) {
    console.error("Error creating instructor:", err);
    console.error("Error details:", err.message);
    res.status(500).json({ error: "Failed to create instructor: " + err.message });
  }
});

// 👩‍🎓 Get all students
app.get("/student_list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students ORDER BY st_studid ASC");
    // PostgreSQL returns lowercase field names by default
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// 📋 Get moderator logs with instructor details
app.get("/moderator_logs", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ml.*,
        m.mod_username,
        m.mod_fname as mod_first_name,
        m.mod_lname as mod_last_name,
        i.in_fname as instructor_first_name,
        i.in_lname as instructor_last_name,
        i.in_email as instructor_email
      FROM moderator_logs ml
      LEFT JOIN moderators m ON ml.mod_id = m.mod_id
      LEFT JOIN instructors i ON ml.ins_id = i.in_instructorid
      ORDER BY ml.log_date_created DESC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching moderator logs:", err);
    res.status(500).json({ error: "Failed to fetch moderator logs" });
  }
});

// 📚 Subjects
app.get("/subject_list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// 📚 Add new subject
app.post("/subject_list", async (req, res) => {
  try {
    const { sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course } = req.body;

    // Check if subject with same MIS code already exists
    const existingSubject = await pool.query(
      "SELECT sb_subid FROM subjects WHERE sb_miscode = $1",
      [sb_miscode]
    );

    if (existingSubject.rows.length > 0) {
      return res.status(400).json({ error: "Subject with this MIS code already exists" });
    }

    // The trigger will automatically set sb_subid based on year
    const result = await pool.query(
      `INSERT INTO subjects 
        (sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course]
    );

    res.status(201).json({
      message: "Subject created successfully",
      ...result.rows[0]
    });
  } catch (err) {
    console.error("Error creating subject:", err);
    res.status(500).json({ error: "Failed to create subject" });
  }
});

// 📚 Update subject
app.put("/subject_list/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course } = req.body;

    // Check if subject exists
    const existingSubject = await pool.query(
      "SELECT sb_subid FROM subjects WHERE sb_subid = $1",
      [id]
    );

    if (existingSubject.rows.length === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Check if MIS code is already used by another subject
    const duplicateMiscode = await pool.query(
      "SELECT sb_subid FROM subjects WHERE sb_miscode = $1 AND sb_subid != $2",
      [sb_miscode, id]
    );

    if (duplicateMiscode.rows.length > 0) {
      return res.status(400).json({ error: "MIS code already used by another subject" });
    }

    const result = await pool.query(
      `UPDATE subjects 
       SET sb_name = $1, sb_miscode = $2, sb_semester = $3, sb_year = $4, sb_units = $5, sb_course = $6
       WHERE sb_subid = $7
       RETURNING *`,
      [sb_name, sb_miscode, sb_semester, sb_year, sb_units, sb_course, id]
    );

    res.json({
      message: "Subject updated successfully",
      ...result.rows[0]
    });
  } catch (err) {
    console.error("Error updating subject:", err);
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// 📚 Delete subject
app.delete("/subject_list/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subject exists
    const existingSubject = await pool.query(
      "SELECT sb_subid FROM subjects WHERE sb_subid = $1",
      [id]
    );

    if (existingSubject.rows.length === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }

    await pool.query("DELETE FROM subjects WHERE sb_subid = $1", [id]);

    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error("Error deleting subject:", err);
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

// 🏫 Sections
app.get("/section_list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM sections");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sections:", err);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

// 📊 Get all evaluations
app.get("/evaluations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.*,
        s.sb_name,
        s.sb_miscode,
        s.sb_course,
        stud.st_fname,
        stud.st_lname,
        i.in_fname,
        i.in_lname
      FROM evaluations e
      LEFT JOIN subjects s ON e.ev_subject = s.sb_subid
      LEFT JOIN students stud ON e.st_studid = stud.st_studid
      LEFT JOIN instructors i ON e.in_instructorid = i.in_instructorid
      ORDER BY e.ev_id DESC
    `);

    if (result.rows.length === 0) {
      return res.json([]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all evaluations:", err);
    res.status(500).json({ error: "Failed to fetch evaluations" });
  }
});

// 📊 Get evaluations by student
app.get("/evaluations/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
          e.*,
          s.sb_name,
          s.sb_miscode,
          s.sb_course,
          i.in_fname,
          i.in_lname
       FROM evaluations e
       LEFT JOIN subjects s ON e.ev_subject = s.sb_subid
       LEFT JOIN instructors i ON e.in_instructorid = i.in_instructorid
       WHERE e.st_studid = $1
       ORDER BY e.ev_id DESC`,
      [studentId]
    );

    if (result.rows.length === 0) {
      return res.json([]); // send empty list if no evaluations
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching evaluations by student:", err);
    res.status(500).json({ error: "Failed to fetch evaluations" });
  }
});

// 📝 Submit evaluation
app.post("/eval_submit", async (req, res) => {
  try {
    const { studentID, instructorID, subjectID, scores, remarks } = req.body;

    if (!studentID || !instructorID || !subjectID || !scores) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Get student's semester
    const studentRes = await pool.query(
      "SELECT st_semester FROM students WHERE st_studid = $1",
      [studentID]
    );

    if (studentRes.rows.length === 0) {
      return res.status(400).json({ error: "Invalid student ID" });
    }

    const semester = studentRes.rows[0].st_semester;

    // 2. Compute averages
    const avg = (ids) =>
      (
        ids.reduce((sum, id) => sum + (scores[id] || 0), 0) / ids.length
      ).toFixed(1);

    const ev_C1 = avg([1, 2, 3]);
    const ev_C2 = avg([4, 5, 6]);
    const ev_C3 = avg([7, 8, 9]);
    const ev_C4 = avg([10, 11, 12]);
    const ev_C5 = avg([13, 14, 15]);

    const ev_total_rating = (
      (parseFloat(ev_C1) +
        parseFloat(ev_C2) +
        parseFloat(ev_C3) +
        parseFloat(ev_C4) +
        parseFloat(ev_C5)) /
      5
    ).toFixed(2);

    // 3. Insert evaluation
    const result = await pool.query(
      `INSERT INTO evaluations 
        (ev_code, ev_subject, ev_semester, ev_C1, ev_C2, ev_C3, ev_C4, ev_C5, 
         ev_total_rating, ev_remark, st_studID, in_instructorID) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        `EV-${Date.now()}`, // unique code
        subjectID,
        semester,
        ev_C1,
        ev_C2,
        ev_C3,
        ev_C4,
        ev_C5,
        ev_total_rating,
        remarks || null,
        studentID,
        instructorID,
      ]
    );

    res.json({
      message: "Evaluation submitted successfully!",
      evaluation: result.rows[0],
    });
  } catch (err) {
    console.error("Error inserting evaluation:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📊 Get evaluations by instructor
app.get("/evaluations/instructor/:instructorId", async (req, res) => {
  const { instructorId } = req.params;

  if (!instructorId || isNaN(instructorId)) {
    return res.status(400).json({ error: "Invalid instructor ID" });
  }

  try {
    const result = await pool.query(
      `SELECT 
          e.*,
          s.sb_name,
          s.sb_miscode,
          s.sb_course,
          stud.st_fname,
          stud.st_lname
       FROM evaluations e
       LEFT JOIN subjects s ON e.ev_subject = s.sb_subid
       LEFT JOIN students stud ON e.st_studid = stud.st_studid
       WHERE e.in_instructorid = $1
       ORDER BY e.ev_id DESC`,
      [parseInt(instructorId, 10)]
    );

    if (result.rows.length === 0) {
      return res.json([]); // Return empty array instead of error
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching evaluations by instructor:", err);
    res.status(500).json({ error: "Failed to fetch evaluations" });
  }
});

// ------------------- Server -------------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});