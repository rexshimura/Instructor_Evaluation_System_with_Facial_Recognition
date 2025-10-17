// controllers/studentSectionController.js
import * as StudentSection from '../models/studentSectionModel.js';

export const assignStudentToSection = async (req, res) => {
  try {
    const { sect_id, stud_id } = req.body;
    
    if (!sect_id || !stud_id) {
      return res.status(400).json({ error: 'Section ID and Student ID are required' });
    }

    const assignment = await StudentSection.createStudentSection(sect_id, stud_id);
    res.status(201).json({ 
      message: 'Student assigned to section successfully', 
      assignment 
    });
  } catch (err) {
    console.error('Error assigning student to section:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllStudentSections = async (req, res) => {
  try {
    const assignments = await StudentSection.getAllStudentSections();
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching student sections:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getStudentSections = async (req, res) => {
  try {
    const { studentId } = req.params;
    const sections = await StudentSection.getSectionsByStudent(studentId);
    res.json(sections);
  } catch (err) {
    console.error('Error fetching student sections:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getSectionStudents = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const students = await StudentSection.getStudentsBySection(sectionId);
    res.json(students);
  } catch (err) {
    console.error('Error fetching section students:', err);
    res.status(500).json({ error: err.message });
  }
};

export const removeStudentFromSection = async (req, res) => {
  try {
    const { id } = req.params;
    await StudentSection.deleteStudentSection(id);
    res.json({ message: 'Student removed from section successfully' });
  } catch (err) {
    console.error('Error removing student from section:', err);
    res.status(500).json({ error: err.message });
  }
};