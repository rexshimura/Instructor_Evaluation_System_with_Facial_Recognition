import * as Section from '../models/sectionModel.js';

export const createSection = async (req, res) => {
  try {
    const s = await Section.createSection(req.body);
    res.status(201).json({ message: 'Section created', section: s });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getSection = async (req, res) => {
  try {
    const s = await Section.getSectionById(req.params.id);
    if (!s) return res.status(404).json({ message: 'Section not found' });
    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const listSections = async (req, res) => {
  try {
    const rows = await Section.getAllSections();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const updated = await Section.updateSection(req.params.id, req.body);
    res.json({ message: 'Section updated', updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    await Section.deleteSection(req.params.id);
    res.json({ message: 'Section deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
