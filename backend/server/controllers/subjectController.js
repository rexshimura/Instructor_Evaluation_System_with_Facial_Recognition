import * as Subject from '../models/subjectModel.js';

export const createSubject = async (req, res) => {
  try {
    const s = await Subject.createSubject(req.body);
    res.status(201).json({ message: 'Subject created', subject: s });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getSubject = async (req, res) => {
  try {
    const s = await Subject.getSubjectById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Subject not found' });
    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const listSubjects = async (req, res) => {
  try {
    const rows = await Subject.getAllSubjects();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const updated = await Subject.updateSubject(req.params.id, req.body);
    res.json({ message: 'Subject updated', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    await Subject.deleteSubject(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};