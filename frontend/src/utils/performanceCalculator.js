// src/utils/performanceCalculator.js

/* This utility file is a centralized engine for all instructor performance calculations.
 * Its main purpose is to prevent code duplication and keep components clean.
 *
 * How it Works:
 * 1.  **Data Filtering:** It takes an `instructorID` and filters all evaluations to find only the ones for that specific instructor.
 * 2.  **Per-Subject Analysis:** It groups the evaluations by `subjectID` to calculate a separate performance summary (average scores) for each subject the instructor taught.
 * 3.  **Overall Performance:** It calculates a comprehensive, overall performance summary by averaging scores across all subjects and evaluations.
 * 4.  **Returns a Single Object:** It returns all of this data (per-subject and overall) in a single, structured object. This allows the calling component (like InstructorProfile.js) to simply receive the data and focus on displaying it, rather than doing the heavy calculations itself.
 */

import evaluations from "../data/evaluations";
// REMOVED: import subjectLoad from "../data/subjectload"; // This import is not used here
import { evaluationQuestions } from "../data/questions";

const calculatePerformance = (instructorId) => {
  const instructorEvaluations = evaluations.filter(
    (evaluation) => evaluation.instructorID === instructorId
  );

  if (instructorEvaluations.length === 0) {
    return null;
  }

  const totalEvaluations = instructorEvaluations.length;
  const performanceBySubject = {};
  const overallQuestionScores = {};
  const overallRemarks = instructorEvaluations.map((evaluation) => evaluation.remarks).filter((remark) => remark.trim() !== "");

  // Initialize overall scores object
  evaluationQuestions.forEach((category) => {
    category.questions.forEach((q) => {
      overallQuestionScores[q.id] = 0;
    });
  });

  // Group evaluations by subject and sum up scores
  instructorEvaluations.forEach((evaluation) => {
    const { subjectID } = evaluation;

    if (!performanceBySubject[subjectID]) {
      performanceBySubject[subjectID] = {
        evaluations: [],
        questionScores: {},
        remarks: [],
      };
      evaluationQuestions.forEach((category) => {
        category.questions.forEach((q) => {
          performanceBySubject[subjectID].questionScores[q.id] = 0;
        });
      });
    }

    performanceBySubject[subjectID].evaluations.push(evaluation);
    performanceBySubject[subjectID].remarks.push(evaluation.remarks);

    for (const qId in evaluation.scores) {
      if (evaluation.scores.hasOwnProperty(qId)) {
        const numericId = parseInt(qId.replace("q", ""), 10);
        if (performanceBySubject[subjectID].questionScores.hasOwnProperty(numericId)) {
          performanceBySubject[subjectID].questionScores[numericId] += evaluation.scores[qId];
        }
        if (overallQuestionScores.hasOwnProperty(numericId)) {
          overallQuestionScores[numericId] += evaluation.scores[qId];
        }
      }
    }
  });

  // Calculate averages for each subject
  for (const subjectId in performanceBySubject) {
    const subjectData = performanceBySubject[subjectId];
    const totalSubjectEvals = subjectData.evaluations.length;

    const subjectAverageCategoryScores = {};
    evaluationQuestions.forEach((category) => {
      let categorySum = 0;
      category.questions.forEach((q) => {
        const avg = subjectData.questionScores[q.id] / totalSubjectEvals;
        categorySum += avg;
      });
      subjectAverageCategoryScores[category.category] = (categorySum / category.questions.length).toFixed(2);
    });
    subjectData.averageCategoryScores = subjectAverageCategoryScores;
  }

  // Calculate overall averages
  const overallAverageCategoryScores = {};
  evaluationQuestions.forEach((category) => {
    let categorySum = 0;
    category.questions.forEach((q) => {
      const avg = overallQuestionScores[q.id] / totalEvaluations;
      categorySum += avg;
    });
    overallAverageCategoryScores[category.category] = (categorySum / category.questions.length).toFixed(2);
  });

  return { performanceBySubject, overallAverageCategoryScores, totalEvaluations, overallRemarks };
};

export default calculatePerformance;