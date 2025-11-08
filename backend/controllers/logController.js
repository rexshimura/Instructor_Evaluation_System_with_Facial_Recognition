import { getAllLogs, createLog } from '../models/logModel.js';

export const fetchLogs = async (req, res) => {
  try {
    const logs = await getAllLogs();
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
};

export const addLog = async (req, res) => {
  try {
    const { mod_id, ins_id, log_action } = req.body;
    if (!mod_id || !ins_id || !log_action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const log = await createLog(mod_id, ins_id, log_action);
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ message: 'Failed to create log' });
  }
};
