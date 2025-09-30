import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import instructorData from "../../data/list-instructors";
import subjectLoad from "../../data/list-subjects";
import evaluations from "../../data/list-evaluations";
import { evaluationQuestions } from "../../data/questions";
import analyzeRemarks from "../../utils/remarkAnalyzer";
import VerifyNavBar from "../../components/module_layout/VerifyNavBar";

// --- Helper Functions & Constants ---
const getScoreWord = (score) => {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Very Good";
  if (score >= 2.5) return "Average";
  if (score >= 1.5) return "Needs Improvement";
  return "Poor";
};


const SCORE_COLORS = {
  Excellent: "bg-teal-500",
  "Very Good": "bg-blue-500",
  Average: "bg-yellow-500",
  "Needs Improvement": "bg-orange-500",
  Poor: "bg-red-500",
};

// --- Child Components for better structure ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center bg-slate-50 p-8 rounded-lg h-full flex justify-center items-center">
    <p className="text-slate-500 italic">{message}</p>
  </div>
);

const InfoCard = ({ title, children, icon }) => (
  <div className="bg-slate-50 p-6 rounded-lg shadow-sm">
    <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-slate-800 flex items-center gap-3">
      {icon}
      {title}
    </h3>
    <div className="space-y-3 text-slate-700">{children}</div>
  </div>
);

const ScoreBar = ({ category, score }) => {
  const scoreWord = getScoreWord(score);
  const barColor = SCORE_COLORS[scoreWord] || "bg-gray-400";
  const barWidth = `${(score / 5) * 100}%`;

  return (
    <div>
      <div className="flex justify-between items-center text-sm font-semibold text-slate-700 mb-1">
        <span>{category}</span>
        <span>
          {scoreWord} ({score})
        </span>
      </div>
      <div className="bg-slate-200 rounded-full h-3">
        <div
          className={`${barColor} rounded-full h-3 transition-all duration-500 ease-out`}
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
};

const RemarksSummary = ({ summary }) => (
  <div className="mb-6">
    <p className="text-lg font-bold text-slate-800 mb-2">Remarks Summary</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-green-100 p-3 rounded-lg text-center border border-green-200">
        <p className="text-2xl font-bold text-green-700">{summary.positiveCount}</p>
        <p className="font-semibold text-sm text-green-800">👍 Positive</p>
      </div>
      <div className="bg-red-100 p-3 rounded-lg text-center border border-red-200">
        <p className="text-2xl font-bold text-red-700">{summary.negativeCount}</p>
        <p className="font-semibold text-sm text-red-800">👎 Negative</p>
      </div>
      <div className="bg-yellow-100 p-3 rounded-lg text-center border border-yellow-200">
        <p className="text-2xl font-bold text-yellow-700">{summary.neutralCount}</p>
        <p className="font-semibold text-sm text-yellow-800">😐 Neutral</p>
      </div>
    </div>
  </div>
);

// --- Performance Calculation Logic (Unchanged) ---
const calculatePerformance = (instructorID) => {
    // ... (Your original calculation logic)
    const processedEvaluations = [];
    let tempEval = {};
    evaluations.forEach(item => {
        if (item.ev_evalID) {
            if (Object.keys(tempEval).length > 0) processedEvaluations.push(tempEval);
            tempEval = { ...item };
        } else if (item.ev_scores) {
            tempEval.ev_scores = item.ev_scores;
        } else if (item.hasOwnProperty('ev_remarks')) {
            tempEval.ev_remarks = item.ev_remarks;
        }
    });
    if (Object.keys(tempEval).length > 0) processedEvaluations.push(tempEval);

    const relevantEvaluations = processedEvaluations.filter(e => e.in_instID && e.in_instID.toString() === instructorID);
    if (relevantEvaluations.length === 0) return null;

    const performanceBySubject = {};
    let allRemarks = [];
    relevantEvaluations.forEach((evaluation) => {
        const { sb_subID, ev_scores, ev_remarks } = evaluation;
        if (!sb_subID || !ev_scores) return;
        if (!performanceBySubject[sb_subID]) {
            performanceBySubject[sb_subID] = { evaluations: [], remarks: [], totalScores: {}, averageCategoryScores: {} };
            evaluationQuestions.forEach((cat) => {
                performanceBySubject[sb_subID].totalScores[cat.category] = { total: 0, count: 0 };
            });
        }
        performanceBySubject[sb_subID].evaluations.push(evaluation);
        if (ev_remarks) {
            performanceBySubject[sb_subID].remarks.push(ev_remarks);
            allRemarks.push(ev_remarks);
        }
        evaluationQuestions.forEach((cat) => {
            cat.questions.forEach((q) => {
                const score = ev_scores[`q${q.id}`];
                if (score !== undefined) {
                    performanceBySubject[sb_subID].totalScores[cat.category].total += score;
                    performanceBySubject[sb_subID].totalScores[cat.category].count += 1;
                }
            });
        });
    });

    for (const subjectId in performanceBySubject) {
        const subjectData = performanceBySubject[subjectId];
        for (const category in subjectData.totalScores) {
            const { total, count } = subjectData.totalScores[category];
            subjectData.averageCategoryScores[category] = count > 0 ? (total / count).toFixed(2) : "0.00";
        }
    }

    const overallTotalScores = {};
    evaluationQuestions.forEach((cat) => {
        overallTotalScores[cat.category] = { total: 0, count: 0 };
    });
    for (const subjectId in performanceBySubject) {
        for (const category in performanceBySubject[subjectId].totalScores) {
            overallTotalScores[category].total += performanceBySubject[subjectId].totalScores[category].total;
            overallTotalScores[category].count += performanceBySubject[subjectId].totalScores[category].count;
        }
    }

    const overallAverageCategoryScores = {};
    for (const category in overallTotalScores) {
        const { total, count } = overallTotalScores[category];
        overallAverageCategoryScores[category] = count > 0 ? (total / count).toFixed(2) : "0.00";
    }

    return { performanceBySubject, overallAverageCategoryScores, overallRemarks: allRemarks, totalEvaluations: relevantEvaluations.length };
};


// --- Main Profile Component ---
export default function InstructorProfile() {
  const { instructorID } = useParams();
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const instructor = useMemo(() =>
    instructorData.find((inst) => inst.in_instructorID.toString() === instructorID),
    [instructorID]
  );

  const subjectsHandled = useMemo(() => {
    if (!instructor) return [];
    return subjectLoad.filter((sub) =>
      instructor.in_subhandled.includes(sub.sb_subID)
    );
  }, [instructor]);

  const performanceData = useMemo(
    () => calculatePerformance(instructorID),
    [instructorID]
  );

  // NEW/REFINED: UseMemo is more efficient for deriving state.
  // It instantly recalculates when its dependencies change, removing the need for a loading spinner on subject change.
  const displayedData = useMemo(() => {
    if (!performanceData) return null;

    if (selectedSubjectId) {
        const subjectData = performanceData.performanceBySubject[selectedSubjectId];
        if (subjectData) {
            return {
                averageCategoryScores: subjectData.averageCategoryScores,
                remarks: subjectData.remarks,
                totalReviews: subjectData.evaluations.length,
            };
        }
    }

    // Fallback to overall data if no subject is selected or found
    return {
        averageCategoryScores: performanceData.overallAverageCategoryScores,
        remarks: performanceData.overallRemarks,
        totalReviews: performanceData.totalEvaluations,
    };
  }, [performanceData, selectedSubjectId]);

  // NEW/REFINED: This effect now only handles the initial loading spinner.
  // The empty dependency array [] means it runs only ONCE when the component mounts.
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 300); // Simulate initial processing time to avoid layout flash

    return () => clearTimeout(timer);
  }, []);

  if (!instructor) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Instructor Not Found</h2>
          <p className="text-slate-600 mt-2">The profile you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  const remarksSummary = displayedData ? analyzeRemarks(displayedData.remarks) : null;
  const hasRemarks = displayedData?.remarks?.filter(r => r && r.trim()).length > 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6">
      <VerifyNavBar />
      <main className="w-full max-w-7xl bg-white rounded-lg shadow-xl p-6 sm:p-8 mt-16 space-y-8">
        <header>
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">
            Instructor Profile
          </h2>
          <p className="text-center text-slate-500">Performance and information overview</p>
        </header>

        {/* --- Instructor Information --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard title="Personal Information" icon="👤">
            <p><strong>Full Name:</strong> {`${instructor.in_fname} ${instructor.in_mname} ${instructor.in_lname} ${instructor.in_suffix}`}</p>
            <p><strong>Date of Birth:</strong> {instructor.in_dob}</p>
            <p><strong>Sex:</strong> {instructor.in_sex === 'M' ? 'Male' : 'Female'}</p>
            <p><strong>Department:</strong> {instructor.in_dept}</p>
          </InfoCard>
          <InfoCard title="Contact Details" icon="📞">
            <p><strong>Email:</strong> <a href={`mailto:${instructor.in_email}`} className="text-blue-600 hover:underline">{instructor.in_email}</a></p>
            <p><strong>Contact Number:</strong> {instructor.in_cnum}</p>
          </InfoCard>
        </section>

        {/* --- Subjects Handled --- */}
        <section>
          <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">Subjects Handled</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className={`p-3 rounded-lg shadow-sm border transition-all duration-200 ${
                !selectedSubjectId
                  ? "bg-blue-600 text-white border-blue-700 font-bold"
                  : "bg-white hover:bg-blue-50 hover:border-blue-300"
              }`}
            >
              <p className="font-medium">Overall Performance</p>
            </button>
            {subjectsHandled.map((subject) => (
              <button
                key={subject.sb_subID}
                onClick={() => setSelectedSubjectId(subject.sb_subID)}
                className={`p-3 text-left rounded-lg shadow-sm border transition-all duration-200 ${
                  selectedSubjectId === subject.sb_subID
                    ? "bg-blue-600 text-white border-blue-700 font-bold"
                    : "bg-white hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                <p className="font-medium">{subject.sb_name}</p>
                <p className="text-sm opacity-80">{`Code: ${subject.sb_miscode} | Units: ${subject.sb_units}`}</p>
              </button>
            ))}
          </div>
        </section>

        {/* --- Performance Metrics --- */}
        <section>
          <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">Performance Metrics</h3>
          {isLoading ? (
            <LoadingSpinner />
          ) : displayedData ? (
            <div className="bg-slate-50 p-6 rounded-lg">
              <p className="text-xl font-bold text-slate-800 mb-4">
                {selectedSubjectId
                  ? `Results for ${subjectsHandled.find(s => s.sb_subID === selectedSubjectId)?.sb_name || 'Subject'}`
                  : "Overall Performance Summary"}
                <span className="text-base font-normal text-slate-600 ml-2">
                  ({displayedData.totalReviews} reviews)
                </span>
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  {Object.entries(displayedData.averageCategoryScores).map(([category, score]) => (
                    <ScoreBar key={category} category={category} score={parseFloat(score)} />
                  ))}
                </div>

                <div>
                  {remarksSummary && displayedData.totalReviews > 0 && (
                    <RemarksSummary summary={remarksSummary} />
                  )}
                  <div>
                    <p className="text-lg font-bold text-slate-800 mb-2">Student Remarks</p>
                    <ul className="space-y-2 h-36 overflow-y-auto bg-white p-3 rounded border border-slate-200 custom-scrollbar">
                      {hasRemarks ? (
                        displayedData.remarks.filter(r => r && r.trim()).map((remark, index) => (
                          <li key={index} className="border-l-4 border-blue-300 pl-3 text-slate-700 italic text-sm">
                            "{remark}"
                          </li>
                        ))
                      ) : (
                         <EmptyState message="No remarks available for this view." />
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState message="No performance data available for this instructor yet." />
          )}
        </section>
      </main>
      {/*<footer className="w-full max-w-7xl mt-8 p-4 text-center text-slate-500 text-sm">*/}
      {/*  <p>&copy; {new Date().getFullYear()} Instructor Evaluation System. All rights reserved.</p>*/}
      {/*</footer>*/}
    </div>
  );
}