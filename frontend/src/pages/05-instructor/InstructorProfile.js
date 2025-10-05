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

// --- Performance Calculation Logic (Updated to handle no evaluations) ---
const calculatePerformance = (evaluations, instructorID) => {
  // If no evaluations, return default structure with zeros
  if (!evaluations || evaluations.length === 0) {
    return {
      performanceBySubject: {},
      overallAverageCategoryScores: getDefaultScores(),
      overallRemarks: [],
      totalEvaluations: 0,
      hasEvaluations: false
    };
  }

  const relevantEvaluations = evaluations.filter(
    e => e.in_instructorid && e.in_instructorid.toString() === instructorID
  );
  
  if (relevantEvaluations.length === 0) {
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

  relevantEvaluations.forEach((evaluation) => {
    const { ev_subject, ev_remark, ev_c1, ev_c2, ev_c3, ev_c4, ev_c5 } = evaluation;
    
    if (!ev_subject) return;

    if (!performanceBySubject[ev_subject]) {
      performanceBySubject[ev_subject] = { 
        evaluations: [], 
        remarks: [], 
        totalScores: {}, 
        averageCategoryScores: {} 
      };
      
      // Initialize category scores
      Object.keys(categoryMapping).forEach(category => {
        performanceBySubject[ev_subject].totalScores[category] = { total: 0, count: 0 };
      });
    }

    performanceBySubject[ev_subject].evaluations.push(evaluation);
    
    if (ev_remark) {
      performanceBySubject[ev_subject].remarks.push(ev_remark);
      allRemarks.push(ev_remark);
    }

    // Add scores from database columns
    const scores = {
      "Course Organization and Content": ev_c1,
      "Instructor's Knowledge and Presentation": ev_c2,
      "Communication and Interaction": ev_c3,
      "Assessment and Feedback": ev_c4,
      "Overall Effectiveness": ev_c5
    };

    Object.entries(scores).forEach(([category, score]) => {
      if (score !== null && score !== undefined) {
        performanceBySubject[ev_subject].totalScores[category].total += parseFloat(score);
        performanceBySubject[ev_subject].totalScores[category].count += 1;
      }
    });
  });

  // Calculate averages per subject
  for (const subjectId in performanceBySubject) {
    const subjectData = performanceBySubject[subjectId];
    for (const category in subjectData.totalScores) {
      const { total, count } = subjectData.totalScores[category];
      subjectData.averageCategoryScores[category] = count > 0 ? (total / count).toFixed(2) : "0.00";
    }
  }

  // Calculate overall averages
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
  }

  return { 
    performanceBySubject, 
    overallAverageCategoryScores, 
    overallRemarks: allRemarks, 
    totalEvaluations: relevantEvaluations.length,
    hasEvaluations: relevantEvaluations.length > 0
  };
};

// --- Main Profile Component ---
export default function InstructorProfile() {
  const { instructorID } = useParams();
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dynamic data
  const [instructor, setInstructor] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch instructor data
        const instructorRes = await fetch(`http://localhost:5000/instructor_list`);
        const instructorsData = await instructorRes.json();
        
        if (instructorsData.error) throw new Error(instructorsData.error);
        
        const foundInstructor = instructorsData.find(
          inst => inst.in_instructorid.toString() === instructorID
        );
        
        if (!foundInstructor) {
          throw new Error("Instructor not found");
        }
        
        setInstructor(foundInstructor);

        // Fetch all subjects
        const subjectsRes = await fetch(`http://localhost:5000/subject_list`);
        const subjectsData = await subjectsRes.json();
        
        if (subjectsData.error) throw new Error(subjectsData.error);
        setAllSubjects(subjectsData);

        // Fetch evaluations for this instructor
        try {
          const evalRes = await fetch(`http://localhost:5000/evaluations/instructor/${instructorID}`);
          const evalData = await evalRes.json();
          
          if (evalData.error && evalData.error !== "No evaluations found") {
            console.warn("Error fetching evaluations:", evalData.error);
            setEvaluations([]);
          } else {
            setEvaluations(evalData.error ? [] : evalData);
          }
        } catch (evalError) {
          console.warn("Could not fetch evaluations, using empty array:", evalError);
          setEvaluations([]);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
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
    if (!instructor || !allSubjects.length) return [];
    
    return allSubjects.filter(subject => 
      instructor.in_subhandled && 
      instructor.in_subhandled.includes(String(subject.sb_subid))
    );
  }, [instructor, allSubjects]);

  // Calculate performance data
  const performanceData = useMemo(
    () => calculatePerformance(evaluations, instructorID),
    [evaluations, instructorID]
  );

  // Determine displayed data
  const displayedData = useMemo(() => {
    if (!performanceData) {
      return {
        averageCategoryScores: getDefaultScores(),
        remarks: [],
        totalReviews: 0,
        hasEvaluations: false
      };
    }

    if (selectedSubjectId) {
      const subjectData = performanceData.performanceBySubject[selectedSubjectId];
      if (subjectData) {
        return {
          averageCategoryScores: subjectData.averageCategoryScores,
          remarks: subjectData.remarks,
          totalReviews: subjectData.evaluations.length,
          hasEvaluations: performanceData.hasEvaluations
        };
      } else {
        // Subject selected but no data for that subject
        return {
          averageCategoryScores: getDefaultScores(),
          remarks: [],
          totalReviews: 0,
          hasEvaluations: false
        };
      }
    }

    // Fallback to overall data
    return {
      averageCategoryScores: performanceData.overallAverageCategoryScores,
      remarks: performanceData.overallRemarks,
      totalReviews: performanceData.totalEvaluations,
      hasEvaluations: performanceData.hasEvaluations
    };
  }, [performanceData, selectedSubjectId]);

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
            <p><strong>Full Name:</strong> {`${instructor.in_fname} ${instructor.in_mname || ''} ${instructor.in_lname} ${instructor.in_suffix || ''}`}</p>
            <p><strong>Date of Birth:</strong> {new Date(instructor.in_dob).toLocaleDateString()}</p>
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
                key={subject.sb_subid}
                onClick={() => setSelectedSubjectId(subject.sb_subid)}
                className={`p-3 text-left rounded-lg shadow-sm border transition-all duration-200 ${
                  selectedSubjectId === subject.sb_subid
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
              {selectedSubjectId
                ? `Results for ${subjectsHandled.find(s => s.sb_subid === selectedSubjectId)?.sb_name || 'Subject'}`
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
                
                {/* Show remarks summary with zeros if no evaluations */}
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

            {/* Information banner when no evaluations */}
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