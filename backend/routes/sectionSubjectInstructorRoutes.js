// routes/sectionSubjectInstructorRoutes.js
import express from 'express';
import * as SSICtrl from '../controllers/sectionSubjectInstructorController.js';
const router = express.Router();

router.post('/', SSICtrl.assignSectionToInstructorSubject);
router.get('/', SSICtrl.getAllSSIAssignments);
router.get('/section/:sectionId', SSICtrl.getSectionAssignments);
router.get('/instructor/:instructorId', SSICtrl.getInstructorAssignments);
router.get('/student/:studentId/evaluable', SSICtrl.getEvaluableInstructors);
router.delete('/:id', SSICtrl.removeAssignment);

export default router;