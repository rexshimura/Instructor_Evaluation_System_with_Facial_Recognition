// routes/evaluationRoutes.js - UPDATED VERSION
import express from 'express';
import * as EvalCtrl from '../controllers/evaluationController.js';
const router = express.Router();

router.post('/', EvalCtrl.submitEvaluation);
router.get('/', EvalCtrl.listEvaluations);
router.get('/student/:studentId', EvalCtrl.getEvaluationsByStudent);
router.get('/instructor/:instructorId', EvalCtrl.getEvaluationsByInstructor);
router.get('/evaluable/:studentId', EvalCtrl.getEvaluableInstructors);
router.get('/check-eligibility/:studentId/:instructorId/:subjectId', EvalCtrl.checkEvaluationEligibility);
router.get('/:id', EvalCtrl.getEvaluation);
router.put('/:id', EvalCtrl.updateEvaluation);
router.delete('/:id', EvalCtrl.deleteEvaluation);

export default router;