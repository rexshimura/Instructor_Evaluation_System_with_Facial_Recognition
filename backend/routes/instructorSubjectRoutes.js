import express from "express";
import {
  getAllInstructorSubjectsController,
  createInstructorSubjectController,
  deleteInstructorSubjectController,
} from "../controllers/instructorSubjectController.js";

const router = express.Router();

router.get("/", getAllInstructorSubjectsController);
router.post("/", createInstructorSubjectController);
router.delete("/:id", deleteInstructorSubjectController);

export default router;
