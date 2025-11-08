import express from 'express';
import { fetchLogs, addLog } from '../controllers/logController.js';

const router = express.Router();

router.get('/', fetchLogs);  // GET /logs
router.post('/', addLog);    // POST /logs

export default router;
