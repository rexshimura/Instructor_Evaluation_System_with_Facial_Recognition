import * as Mod from '../models/moderatorModel.js';
import * as Log from '../models/logModel.js';

export const listModerators = async (req, res) => {
  try {
    const rows = await Mod.getAllModerators();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const createModerator = async (req, res) => {
  try {
    const mod = await Mod.createModerator(req.body);
    res.status(201).json({ message: 'Moderator created', moderator: mod });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateModerator = async (req, res) => {
  try {
    const updated = await Mod.updateModerator(req.params.id, req.body);
    res.json({ message: 'Moderator updated', moderator: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteModerator = async (req, res) => {
  try {
    await Mod.deleteModerator(req.params.id);
    res.json({ message: 'Moderator deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const loginModerator = async (req, res) => {
  try {
    const { username, password } = req.body;
    const mod = await Mod.loginModerator(username, password);
    if (!mod) return res.status(401).json({ error: 'Invalid username or password' });
    res.json({ message: 'Login successful', moderator: mod });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const listLogs = async (req, res) => {
  try {
    const rows = await Log.getAllLogs();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
