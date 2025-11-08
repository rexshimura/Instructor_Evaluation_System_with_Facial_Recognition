import express from 'express';
import * as StudentCtrl from '../controllers/studentController.js';
const router = express.Router();

router.post('/', StudentCtrl.createStudent);
router.get('/', StudentCtrl.listStudents);
router.get('/:id', StudentCtrl.getStudent);
router.put('/:id', StudentCtrl.updateStudent);
router.delete('/:id', StudentCtrl.deleteStudent);
router.post('/login', StudentCtrl.loginStudent);

export default router;
