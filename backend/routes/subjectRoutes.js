import express from 'express';
import * as SubCtrl from '../controllers/subjectController.js';
const router = express.Router();

router.post('/', SubCtrl.createSubject);
router.get('/', SubCtrl.listSubjects);
router.get('/:id', SubCtrl.getSubject);
router.put('/:id', SubCtrl.updateSubject);
router.delete('/:id', SubCtrl.deleteSubject);

export default router;
