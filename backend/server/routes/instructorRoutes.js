import express from 'express';
import * as InsCtrl from '../controllers/instructorController.js';
const router = express.Router();

router.post('/', InsCtrl.createInstructor);
router.get('/', InsCtrl.listInstructors);
router.get('/:id', InsCtrl.getInstructor);
router.put('/:id', InsCtrl.updateInstructor);
router.delete('/:id', InsCtrl.deleteInstructor);

export default router;
