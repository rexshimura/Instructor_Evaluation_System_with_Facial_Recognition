import * as Instructor from '../models/instructorModel.js';
import * as Log from '../models/logModel.js';

export const createInstructor = async (req, res) => {
  try {
    const ins = await Instructor.createInstructor(req.body);
    // optionally log if moderator_id passed in body
    if (req.body.moderator_id) {
      await Log.createLog(req.body.moderator_id, ins.ins_id, 'Registered');
    }
    res.status(201).json({ message: 'Instructor created', ins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getInstructor = async (req, res) => {
  try {
    const ins = await Instructor.getInstructorById(req.params.id);
    if (!ins) return res.status(404).json({ message: 'Instructor not found' });
    res.json(ins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const listInstructors = async (req, res) => {
  try {
    const rows = await Instructor.getAllInstructors();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateInstructor = async (req, res) => {
  try {
    const updated = await Instructor.updateInstructor(req.params.id, req.body);
    res.json({ message: 'Instructor updated', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteInstructor = async (req, res) => {
  try {
    await Instructor.deleteInstructor(req.params.id);
    res.json({ message: 'Instructor deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
