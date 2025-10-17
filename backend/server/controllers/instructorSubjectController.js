import {
  getAllInstructorSubjects,
  createInstructorSubject,
  deleteInstructorSubject,
} from "../models/instructorSubjectModel.js";

export const getAllInstructorSubjectsController = async (req, res) => {
  try {
    const data = await getAllInstructorSubjects();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching instructor-subjects:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const createInstructorSubjectController = async (req, res) => {
  const { ins_id, sub_id } = req.body;

  if (!ins_id || !sub_id) {
    return res.status(400).json({ error: "Instructor ID and Subject ID are required" });
  }

  try {
    const data = await createInstructorSubject(ins_id, sub_id);
    res.status(201).json({
      message: "Instructor-subject link created successfully",
      data,
    });
  } catch (err) {
    console.error("Error creating instructor-subject:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const deleteInstructorSubjectController = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await deleteInstructorSubject(id);
    res.status(200).json({
      message: "Instructor-subject link deleted successfully",
      deleted,
    });
  } catch (err) {
    console.error("Error deleting instructor-subject:", err.message);
    res.status(500).json({ error: err.message });
  }
};
