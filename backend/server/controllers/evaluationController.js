// controllers/evaluationController.js - ENHANCED VERSION
import * as Eval from '../models/evaluationModel.js';

export const submitEvaluation = async (req, res) => {
  try {
    // Check if evaluation is allowed
    const canEval = await Eval.canEvaluate(
      req.body.stud_id, 
      req.body.ins_id, 
      req.body.sub_id
    );
    
    if (!canEval) {
      return res.status(403).json({ 
        error: 'Not allowed to evaluate this instructor for the specified subject' 
      });
    }

    const created = await Eval.createEvaluation(req.body);
    res.status(201).json({ 
      message: 'Evaluation submitted successfully', 
      evaluation: created 
    });
  } catch (err) {
    console.error('Error submitting evaluation:', err);
    res.status(500).json({ error: err.message });
  }
};

export const listEvaluations = async (req, res) => {
  try {
    const rows = await Eval.getAllEvaluations();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching evaluations:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getEvaluationsByInstructor = async (req, res) => {
  try {
    const rows = await Eval.getEvaluationsByInstructor(req.params.instructorId);
    const stats = await Eval.getEvaluationStats(req.params.instructorId);
    
    res.json({
      evaluations: rows,
      statistics: stats
    });
  } catch (err) {
    console.error('Error fetching instructor evaluations:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getEvaluationsByStudent = async (req, res) => {
  try {
    const rows = await Eval.getEvaluationsByStudent(req.params.studentId);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching student evaluations:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getEvaluation = async (req, res) => {
  try {
    const e = await Eval.getEvaluationById(req.params.id);
    if (!e) return res.status(404).json({ message: 'Evaluation not found' });
    res.json(e);
  } catch (err) {
    console.error('Error fetching evaluation:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateEvaluation = async (req, res) => {
  try {
    const updated = await Eval.updateEvaluation(req.params.id, req.body);
    res.json({ 
      message: 'Evaluation updated successfully', 
      evaluation: updated 
    });
  } catch (err) {
    console.error('Error updating evaluation:', err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteEvaluation = async (req, res) => {
  try {
    await Eval.deleteEvaluation(req.params.id);
    res.json({ message: 'Evaluation deleted successfully' });
  } catch (err) {
    console.error('Error deleting evaluation:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getEvaluableInstructors = async (req, res) => {
  try {
    const { studentId } = req.params;
    const instructors = await Eval.getEvaluableInstructors(studentId);
    res.json(instructors);
  } catch (err) {
    console.error('Error fetching evaluable instructors:', err);
    res.status(500).json({ error: err.message });
  }
};

export const checkEvaluationEligibility = async (req, res) => {
  try {
    const { studentId, instructorId, subjectId } = req.params;
    const canEval = await Eval.canEvaluate(studentId, instructorId, subjectId);
    res.json({ canEvaluate: canEval });
  } catch (err) {
    console.error('Error checking evaluation eligibility:', err);
    res.status(500).json({ error: err.message });
  }
};