// backend/server/routes/instructorFaceRoutes.js
import express from 'express';
import {
  registerInstructorFace,
  getInstructorFaces,
  deleteInstructorFace,
  getInstructorByFaceUuid 
} from '../controllers/instructorFaceController.js';

const router = express.Router();

router.post('/register', registerInstructorFace);
router.get('/instructor/:instructorId', getInstructorFaces);
router.get('/face/:faceUuid', getInstructorByFaceUuid); 
router.delete('/:id', deleteInstructorFace);

export default router;