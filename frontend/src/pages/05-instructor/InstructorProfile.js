import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
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

// Category mapping for database criteria
const categoryMapping = {
  "Course Organization and Content": "ev_C1",
  "Instructor's Knowledge and Presentation": "ev_C2", 
  "Communication and Interaction": "ev_C3",
  "Assessment and Feedback": "ev_C4",
  "Overall Effectiveness": "ev_C5"
};

// Default zero scores for when no evaluations exist
const getDefaultScores = () => ({
  "Course Organization and Content": "0.00",
  "Instructor's Knowledge and Presentation": "0.00",
  "Communication and Interaction": "0.00", 
  "Assessment and Feedback": "0.00",
  "Overall Effectiveness": "0.00"
});

// --- Child Components ---

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
  const barColor = score === 0 ? "bg-gray-400" : (SCORE_COLORS[scoreWord] || "bg-gray-400");
  const barWidth = `${(score / 5) * 100}%`;

  return (
    <div>
      <div className="flex justify-between items-center text-sm font-semibold text-slate-700 mb-1">
        <span>{category}</span>
        <span>
          {score === 0 ? "No Data" : `${scoreWord} (${score})`}
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

// --- Performance Calculation Logic ---
const calculatePerformance = (evaluations, instructorID) => {
  console.log("🔍 [DEBUG] Starting calculatePerformance with:", {
    evaluationsCount: evaluations?.length,
    instructorID,
    firstEvaluation: evaluations?.[0]
  });

  if (!evaluations || evaluations.length === 0) {
    console.log("🔍 [DEBUG] No evaluations found");
    return {
      performanceBySubject: {},
      overallAverageCategoryScores: getDefaultScores(),
      overallRemarks: [],
      totalEvaluations: 0,
      hasEvaluations: false
    };
  }

  // Filter evaluations for this instructor (already filtered by backend, but double-check)
  const relevantEvaluations = evaluations.filter(
    e => e.ins_id && e.ins_id.toString() === instructorID.toString()
  );
  
  console.log("🔍 [DEBUG] Relevant evaluations after filtering:", relevantEvaluations.length);

  if (relevantEvaluations.length === 0) {
    console.log("🔍 [DEBUG] No relevant evaluations after filtering");
    return {
      performanceBySubject: {},
      overallAverageCategoryScores: getDefaultScores(),
      overallRemarks: [],
      totalEvaluations: 0,
      hasEvaluations: false
    };
  }

  const performanceBySubject = {};
  let allRemarks = [];

  relevantEvaluations.forEach((evaluation, index) => {
    console.log(`🔍 [DEBUG] Processing evaluation ${index}:`, {
      // Check both uppercase and lowercase field names
      ev_C1: evaluation.ev_C1,
      ev_c1: evaluation.ev_c1,
      ev_C2: evaluation.ev_C2,
      ev_c2: evaluation.ev_c2,
      ev_C3: evaluation.ev_C3,
      ev_c3: evaluation.ev_c3,
      ev_C4: evaluation.ev_C4,
      ev_c4: evaluation.ev_c4,
      ev_C5: evaluation.ev_C5,
      ev_c5: evaluation.ev_c5,
      sub_id: evaluation.sub_id,
      ins_id: evaluation.ins_id
    });

    const ev_subject = evaluation.ev_subject || evaluation.subject_name;
    const ev_remark = evaluation.ev_remark;
    const sub_id = evaluation.sub_id;
    
    const subjectKey = sub_id || ev_subject;

    if (!subjectKey) return;

    if (!performanceBySubject[subjectKey]) {
      performanceBySubject[subjectKey] = { 
        evaluations: [], 
        remarks: [], 
        totalScores: {}, 
        averageCategoryScores: {},
        subjectName: ev_subject || `Subject ${sub_id}`
      };
      
      Object.keys(categoryMapping).forEach(category => {
        performanceBySubject[subjectKey].totalScores[category] = { total: 0, count: 0 };
      });
    }

    performanceBySubject[subjectKey].evaluations.push(evaluation);
    
    if (ev_remark && ev_remark.trim() !== '') {
      performanceBySubject[subjectKey].remarks.push(ev_remark);
      allRemarks.push(ev_remark);
    }

    // FIX: Handle both uppercase and lowercase field names
    const scores = {
      "Course Organization and Content": evaluation.ev_C1 || evaluation.ev_c1,
      "Instructor's Knowledge and Presentation": evaluation.ev_C2 || evaluation.ev_c2,
      "Communication and Interaction": evaluation.ev_C3 || evaluation.ev_c3,
      "Assessment and Feedback": evaluation.ev_C4 || evaluation.ev_c4,
      "Overall Effectiveness": evaluation.ev_C5 || evaluation.ev_c5
    };

    Object.entries(scores).forEach(([category, score]) => {
      // Convert to number and handle any string values
      const numericScore = parseFloat(score);
      console.log(`🔍 [DEBUG] Processing ${category}: ${score} -> ${numericScore}`);
      
      if (!isNaN(numericScore) && numericScore > 0) {
        performanceBySubject[subjectKey].totalScores[category].total += numericScore;
        performanceBySubject[subjectKey].totalScores[category].count += 1;
        console.log(`🔍 [DEBUG] Added ${numericScore} to ${category}`);
      } else {
        console.log(`🔍 [DEBUG] Invalid score for ${category}: ${score}`);
      }
    });
  });

  // Calculate averages for each subject
  for (const subjectId in performanceBySubject) {
    const subjectData = performanceBySubject[subjectId];
    console.log(`🔍 [DEBUG] Calculating averages for subject ${subjectId}:`, subjectData.totalScores);
    
    for (const category in subjectData.totalScores) {
      const { total, count } = subjectData.totalScores[category];
      console.log(`🔍 [DEBUG] ${category}: total=${total}, count=${count}`);
      
      subjectData.averageCategoryScores[category] = count > 0 ? (total / count).toFixed(2) : "0.00";
      console.log(`🔍 [DEBUG] Average for ${category}: ${subjectData.averageCategoryScores[category]}`);
    }
  }

  // Calculate overall averages across all subjects
  const overallTotalScores = {};
  Object.keys(categoryMapping).forEach(category => {
    overallTotalScores[category] = { total: 0, count: 0 };
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
    console.log(`🔍 [DEBUG] Overall average for ${category}: ${overallAverageCategoryScores[category]}`);
  }

  const result = { 
    performanceBySubject, 
    overallAverageCategoryScores, 
    overallRemarks: allRemarks, 
    totalEvaluations: relevantEvaluations.length,
    hasEvaluations: relevantEvaluations.length > 0
  };
  
  console.log("🔍 [DEBUG] Final performance data:", result);
  return result;
};

// --- Main Profile Component ---
export default function InstructorProfile() {
  const { instructorID } = useParams();
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [instructor, setInstructor] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [instructorSubjects, setInstructorSubjects] = useState([]);

  // Normalize evaluation field names to handle case sensitivity
  const normalizedEvaluations = useMemo(() => {
    return evaluations.map(evaluation => ({
      ...evaluation,
      // Ensure uppercase field names exist, fallback to lowercase
      ev_C1: evaluation.ev_C1 || evaluation.ev_c1,
      ev_C2: evaluation.ev_C2 || evaluation.ev_c2,
      ev_C3: evaluation.ev_C3 || evaluation.ev_c3,
      ev_C4: evaluation.ev_C4 || evaluation.ev_c4,
      ev_C5: evaluation.ev_C5 || evaluation.ev_c5
    }));
  }, [evaluations]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔍 [DEBUG] Starting data fetch for instructor:", instructorID);

        // Fetch instructor data
        const instructorRes = await fetch(`/instructors/${instructorID}`);
        if (!instructorRes.ok) {
          if (instructorRes.status === 404) {
            throw new Error("Instructor not found");
          }
          throw new Error("Failed to fetch instructor");
        }
        
        const instructorData = await instructorRes.json();
        console.log("🔍 [DEBUG] Instructor data:", instructorData);
        setInstructor(instructorData);

        // Fetch all subjects
        const subjectsRes = await fetch(`/subjects`);
        if (!subjectsRes.ok) {
          throw new Error("Failed to fetch subjects");
        }
        
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);

        // Fetch instructor-subject relationships
        try {
          const instructorSubjectsRes = await fetch(`/instructor-subject`);
          if (instructorSubjectsRes.ok) {
            const instructorSubjectsData = await instructorSubjectsRes.json();
            setInstructorSubjects(instructorSubjectsData);
          }
        } catch (err) {
          console.log("Instructor-subject data not available, continuing without it");
        }

        // Fetch evaluations for this instructor
        try {
          const evalRes = await fetch(`/evaluations/instructor/${instructorID}`);
          if (!evalRes.ok) {
            if (evalRes.status === 404) {
              console.log("🔍 [DEBUG] No evaluations found (404)");
              setEvaluations([]);
            } else {
              throw new Error("Failed to fetch evaluations");
            }
          } else {
            const evalData = await evalRes.json();
            console.log("🔍 [DEBUG] Raw evaluation response:", evalData);
            
            // Handle backend response structure
            let evaluationsArray = [];
            
            if (Array.isArray(evalData)) {
              evaluationsArray = evalData;
            } else if (evalData && Array.isArray(evalData.evaluations)) {
              evaluationsArray = evalData.evaluations;
            } else if (evalData && evalData.evaluations === undefined && evalData.statistics === undefined) {
              evaluationsArray = Array.isArray(evalData) ? evalData : [evalData];
            }
            
            console.log("🔍 [DEBUG] Processed evaluations array:", evaluationsArray);
            console.log("🔍 [DEBUG] First evaluation sample:", evaluationsArray[0]);
            
            setEvaluations(evaluationsArray);
          }
        } catch (evalError) {
          console.log("🔍 [DEBUG] Evaluations fetch error:", evalError);
          setEvaluations([]);
        }

      } catch (err) {
        console.error("🔍 [DEBUG] Error fetching data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (instructorID) {
      fetchData();
    }
  }, [instructorID]);

  // Get subjects handled by this instructor
  const subjectsHandled = useMemo(() => {
    if (!instructor || !subjects.length || !instructorSubjects.length) return [];
    
    const instructorSubjectLinks = instructorSubjects.filter(
      link => link.ins_id && link.ins_id.toString() === instructorID
    );
    
    return instructorSubjectLinks.map(link => {
      const subject = subjects.find(s => s.sub_id === link.sub_id);
      return subject ? {
        sub_id: subject.sub_id,
        sub_name: subject.sub_name,
        sub_miscode: subject.sub_miscode,
        sub_units: subject.sub_units,
        sub_semester: subject.sub_semester,
        sub_course: subject.sub_course
      } : null;
    }).filter(Boolean);
  }, [instructor, subjects, instructorSubjects, instructorID]);

  // Calculate performance data using normalized evaluations
  const performanceData = useMemo(
    () => calculatePerformance(normalizedEvaluations, instructorID),
    [normalizedEvaluations, instructorID]
  );

  // Debug effect to log data changes
  useEffect(() => {
    console.log("🔍 [DEBUG] Original evaluations:", {
      count: evaluations.length,
      firstEval: evaluations[0],
      allEvals: evaluations
    });
  }, [evaluations]);

  useEffect(() => {
    console.log("🔍 [DEBUG] Normalized evaluations:", {
      count: normalizedEvaluations.length,
      firstEval: normalizedEvaluations[0],
      allEvals: normalizedEvaluations
    });
  }, [normalizedEvaluations]);

  useEffect(() => {
    console.log("🔍 [DEBUG] Performance data updated:", performanceData);
  }, [performanceData]);

  // Determine displayed data
  const displayedData = useMemo(() => {
    if (!performanceData) {
      return {
        averageCategoryScores: getDefaultScores(),
        remarks: [],
        totalReviews: 0,
        hasEvaluations: false,
        subjectName: "Overall Performance"
      };
    }

    if (selectedSubjectId) {
      const subjectData = performanceData.performanceBySubject[selectedSubjectId];
      if (subjectData) {
        return {
          averageCategoryScores: subjectData.averageCategoryScores,
          remarks: subjectData.remarks,
          totalReviews: subjectData.evaluations.length,
          hasEvaluations: performanceData.hasEvaluations,
          subjectName: subjectData.subjectName
        };
      } else {
        const subject = subjectsHandled.find(s => s.sub_id === selectedSubjectId);
        return {
          averageCategoryScores: getDefaultScores(),
          remarks: [],
          totalReviews: 0,
          hasEvaluations: false,
          subjectName: subject?.sub_name || 'Selected Subject'
        };
      }
    }

    return {
      averageCategoryScores: performanceData.overallAverageCategoryScores,
      remarks: performanceData.overallRemarks,
      totalReviews: performanceData.totalEvaluations,
      hasEvaluations: performanceData.hasEvaluations,
      subjectName: "Overall Performance"
    };
  }, [performanceData, selectedSubjectId, subjectsHandled]);

  // Safe data access for instructor
  const instructorName = instructor ? 
    `${instructor.ins_fname || ''} ${instructor.ins_mname ? instructor.ins_mname[0] + '.' : ''} ${instructor.ins_lname || ''} ${instructor.ins_suffix || ''}`.trim() 
    : '';

  const instructorDob = instructor?.ins_dob ? new Date(instructor.ins_dob).toLocaleDateString() : 'N/A';
  const instructorSex = instructor?.ins_sex || 'N/A';
  const instructorDept = instructor?.ins_dept || 'N/A';
  const instructorEmail = instructor?.ins_email || 'N/A';
  const instructorContact = instructor?.ins_contact || 'N/A';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6">
        <VerifyNavBar />
        <div className="w-full max-w-7xl bg-white rounded-lg shadow-xl p-8 mt-16 flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6">
        <VerifyNavBar />
        <div className="w-full max-w-7xl bg-white rounded-lg shadow-xl p-8 mt-16 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
            <p><strong>Full Name:</strong> {instructorName}</p>
            <p><strong>Date of Birth:</strong> {instructorDob}</p>
            <p><strong>Sex:</strong> {instructorSex}</p>
            <p><strong>Department:</strong> {instructorDept}</p>
            <p><strong>Instructor ID:</strong> {instructorID}</p>
          </InfoCard>
          <InfoCard title="Contact Details" icon="📞">
            <p><strong>Email:</strong> 
              {instructorEmail !== 'N/A' ? (
                <a href={`mailto:${instructorEmail}`} className="text-blue-600 hover:underline ml-1">
                  {instructorEmail}
                </a>
              ) : (
                <span className="ml-1">N/A</span>
              )}
            </p>
            <p><strong>Contact Number:</strong> {instructorContact}</p>
          </InfoCard>
        </section>

        {/* --- Subjects Handled --- */}
        <section>
          <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">
            Subjects Handled ({subjectsHandled.length})
          </h3>
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
                key={subject.sub_id}
                onClick={() => setSelectedSubjectId(subject.sub_id)}
                className={`p-3 text-left rounded-lg shadow-sm border transition-all duration-200 ${
                  selectedSubjectId === subject.sub_id
                    ? "bg-blue-600 text-white border-blue-700 font-bold"
                    : "bg-white hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                <p className="font-medium">{subject.sub_name}</p>
                <p className="text-sm opacity-80">
                  {`${subject.sub_miscode} | ${subject.sub_course} | Sem ${subject.sub_semester} | ${subject.sub_units} units`}
                </p>
              </button>
            ))}
          </div>
          {subjectsHandled.length === 0 && (
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-500 italic">No subjects assigned to this instructor</p>
            </div>
          )}
        </section>

        {/* --- Performance Metrics --- */}
        <section>
          <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">
            Performance Metrics
            {!displayedData.hasEvaluations && (
              <span className="text-sm font-normal text-orange-600 ml-2">
                (No evaluations yet)
              </span>
            )}
          </h3>
          
          <div className="bg-slate-50 p-6 rounded-lg">
            <p className="text-xl font-bold text-slate-800 mb-4">
              {displayedData.subjectName}
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
                
                {!displayedData.hasEvaluations && (
                  <RemarksSummary summary={{ positiveCount: 0, negativeCount: 0, neutralCount: 0 }} />
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
                      <EmptyState message={
                        displayedData.hasEvaluations 
                          ? "No remarks available for this view." 
                          : "No evaluations submitted yet."
                      } />
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {!displayedData.hasEvaluations && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> This instructor has not been evaluated yet. 
                  The performance metrics will display actual data once students submit evaluations.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}