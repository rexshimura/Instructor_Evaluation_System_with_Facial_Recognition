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

// ------------------- Routes -------------------

// 🔑 Moderator login
app.post("/moderator_login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM moderators WHERE mod_username = $1 AND mod_password = $2",
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

// 👩‍🎓 Get all students
app.get("/student_list", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students ORDER BY st_studid ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Failed to fetch students" });
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




// ------------------- Server -------------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
