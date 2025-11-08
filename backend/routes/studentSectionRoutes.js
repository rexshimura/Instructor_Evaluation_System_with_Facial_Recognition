// routes/studentSectionRoutes.js
import express from 'express';
import * as StudentSectionCtrl from '../controllers/studentSectionController.js';
const router = express.Router();

router.post('/', StudentSectionCtrl.assignStudentToSection);
router.get('/', StudentSectionCtrl.getAllStudentSections);
router.get('/student/:studentId', StudentSectionCtrl.getStudentSections);
router.get('/section/:sectionId', StudentSectionCtrl.getSectionStudents);
router.delete('/:id', StudentSectionCtrl.removeStudentFromSection);

export default router;