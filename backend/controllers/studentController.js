import * as Student from '../models/studentModel.js';

export const createStudent = async (req, res) => {
  try {
    const student = await Student.createStudent(req.body);
    res.status(201).json({ message: 'Student created', student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getStudent = async (req, res) => {
  try {
    const student = await Student.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const listStudents = async (req, res) => {
  try {
    const rows = await Student.getAllStudents();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const updated = await Student.updateStudent(req.params.id, req.body);
    res.json({ message: 'Student updated', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    await Student.deleteStudent(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const loginStudent = async (req, res) => {
  const { studentId, dob } = req.body;

  try {
    console.log('Login attempt for student:', studentId, 'DOB:', dob);

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    if (!dob) {
      return res.status(400).json({ message: 'Date of Birth is required' });
    }

    // Try using direct SQL query if stored procedure fails
    let student;
    try {
      student = await Student.getStudentById(studentId);
    } catch (modelError) {
      console.log('Trying alternative method...');
      student = await Student.findStudentById(studentId);
    }

    if (!student) {
      console.log('Student not found:', studentId);
      return res.status(401).json({ message: 'Invalid Student ID or Date of Birth' });
    }

    console.log('Found student:', student);

    // Verify date of birth with timezone handling
    try {
      // Get the raw date string from database (without timezone conversion)
      const studentDobRaw = student.stud_dob;
      console.log('Raw student DOB from DB:', studentDobRaw);

      // Parse dates without timezone issues
      const studentDob = new Date(studentDobRaw);
      const inputDob = new Date(dob);

      // Use local date parts for comparison (ignores timezone)
      const studentYear = studentDob.getFullYear();
      const studentMonth = studentDob.getMonth() + 1; // Months are 0-indexed
      const studentDay = studentDob.getDate();

      const inputYear = inputDob.getFullYear();
      const inputMonth = inputDob.getMonth() + 1;
      const inputDay = inputDob.getDate();

      console.log('Student DOB parts:', { studentYear, studentMonth, studentDay });
      console.log('Input DOB parts:', { inputYear, inputMonth, inputDay });

      // Compare year, month, and day separately
      if (studentYear !== inputYear || studentMonth !== inputMonth || studentDay !== inputDay) {
        console.log('DOB mismatch');
        return res.status(401).json({ message: 'Invalid Student ID or Date of Birth' });
      }

      console.log('DOB match confirmed');

    } catch (dateError) {
      console.error('Date comparison error:', dateError);
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // ✅ Success — Return limited student info
    // In studentController.js loginStudent function
    res.json({
      message: 'Login successful',
      student: {
        stud_id: student.stud_id,
        stud_fname: student.stud_fname,
        stud_lname: student.stud_lname,
        stud_course: student.stud_course,
        stud_year: student.stud_year,
        stud_section: student.stud_section,
        stud_semester: student.stud_semester,
      },
    });
  } catch (err) {
    console.error('Error logging in student:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};