import express from 'express';
import * as ModCtrl from '../controllers/moderatorController.js';
const router = express.Router();

router.get('/', ModCtrl.listModerators);
router.post('/', ModCtrl.createModerator);
router.get('/logs', ModCtrl.listLogs);
router.post('/login', ModCtrl.loginModerator); 
router.put('/:id', ModCtrl.updateModerator);
router.delete('/:id', ModCtrl.deleteModerator);

export default router;