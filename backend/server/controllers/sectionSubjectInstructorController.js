// controllers/sectionSubjectInstructorController.js
import * as SSI from '../models/sectionSubjectInstructorModel.js';

export const assignSectionToInstructorSubject = async (req, res) => {
  try {
    const { sect_id, insub_id } = req.body;
    
    if (!sect_id || !insub_id) {
      return res.status(400).json({ error: 'Section ID and Instructor-Subject ID are required' });
    }

    const assignment = await SSI.createSSI(sect_id, insub_id);
    res.status(201).json({ 
      message: 'Section assigned to instructor-subject successfully', 
      assignment 
    });
  } catch (err) {
    console.error('Error creating section assignment:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllSSIAssignments = async (req, res) => {
  try {
    const assignments = await SSI.getAllSSIAssignments();
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching SSI assignments:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getSectionAssignments = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const assignments = await SSI.getBySection(sectionId);
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching section assignments:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getInstructorAssignments = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const assignments = await SSI.getByInstructor(instructorId);
    res.json(assignments);
  } catch (err) {
    console.error('Error fetching instructor assignments:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getEvaluableInstructors = async (req, res) => {
  try {
    const { studentId } = req.params;
    const instructors = await SSI.getEvaluableInstructors(studentId);
    res.json(instructors);
  } catch (err) {
    console.error('Error fetching evaluable instructors:', err);
    res.status(500).json({ error: err.message });
  }
};

export const removeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await SSI.deleteSSI(id);
    res.json({ message: 'Assignment removed successfully' });
  } catch (err) {
    console.error('Error removing assignment:', err);
    res.status(500).json({ error: err.message });
  }
};