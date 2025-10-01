import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavBar from "../../../components/module_layout/AdminNavBar";

// --- Data Imports ---
import instructors from "../../../data/list-instructors";
import subjectLoad from "../../../data/list-subjects";
import evaluations from "../../../data/list-evaluations";
import { evaluationQuestions } from "../../../data/questions";

// --- Utility Import ---
import analyzeRemarks from "../../../utils/remarkAnalyzer";

const semesterMap = {
  1: "1st Semester",
  2: "2nd Semester",
  3: "Summer",
};

// ===================================================================
// --- HELPER COMPONENTS & FUNCTIONS (from InstructorProfile.js) ---
// ===================================================================

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

const InfoCard = ({ title, children }) => (
  <div className="bg-slate-50 p-4 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-slate-700">
      {title}
    </h3>
    <div className="space-y-2 text-sm text-slate-600">{children}</div>
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center bg-slate-100 p-8 rounded-lg h-50% flex justify-center items-center">
    <p className="text-slate-500 italic">{message}</p>
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
      <div className="bg-slate-200 rounded-full h-2.5">
        <div
          className={`${barColor} rounded-full h-2.5 transition-all duration-500 ease-out`}
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
};

// --- ADDED BACK: Component to display sentiment counts ---
const RemarksSummary = ({ summary }) => (
  <div className="mb-3">
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-green-100 p-2 rounded-lg text-center border border-green-200">
        <p className="text-xl font-bold text-green-700">{summary.positiveCount}</p>
        <p className="font-semibold text-xs text-green-800">Positive</p>
      </div>
      <div className="bg-red-100 p-2 rounded-lg text-center border border-red-200">
        <p className="text-xl font-bold text-red-700">{summary.negativeCount}</p>
        <p className="font-semibold text-xs text-red-800">Negative</p>
      </div>
      <div className="bg-yellow-100 p-2 rounded-lg text-center border border-yellow-200">
        <p className="text-xl font-bold text-yellow-700">{summary.neutralCount}</p>
        <p className="font-semibold text-xs text-yellow-800">Neutral</p>
      </div>
    </div>
  </div>
);


const calculatePerformance = (instructorID) => {
    // Process the split evaluation data structure
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

    // Aggregate scores and remarks per subject
    relevantEvaluations.forEach((evaluation) => {
        const { sb_subID, ev_scores, ev_remarks } = evaluation;
        if (!sb_subID || !ev_scores) return;
        if (!performanceBySubject[sb_subID]) {
            performanceBySubject[sb_subID] = { evaluations: [], remarks: [], totalScores: {} };
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

    // Calculate average scores for each subject
    for (const subjectId in performanceBySubject) {
        const subjectData = performanceBySubject[subjectId];
        subjectData.averageCategoryScores = {};
        for (const category in subjectData.totalScores) {
            const { total, count } = subjectData.totalScores[category];
            subjectData.averageCategoryScores[category] = count > 0 ? (total / count).toFixed(2) : "0.00";
        }
    }

    // Calculate overall average scores across all subjects
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


// ===============================================
// --- MAIN COMPONENT: AdminInstructorList ---
// ===============================================

const AdminInstructorList = () => {
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterSemester, setFilterSemester] = useState("All");

  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const { instructorID } = useParams();
  const navigate = useNavigate();

  const instructorsWithSubjects = useMemo(() => {
    return instructors.map((inst) => {
      const subjects = subjectLoad.filter((sub) => inst.in_subhandled.includes(sub.sb_subID));
      return { ...inst, subjects };
    });
  }, []);

  const performanceData = useMemo(() => {
    if (!selectedInstructor) return null;
    return calculatePerformance(String(selectedInstructor.in_instructorID));
  }, [selectedInstructor]);

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

    return {
        averageCategoryScores: performanceData.overallAverageCategoryScores,
        remarks: performanceData.overallRemarks,
        totalReviews: performanceData.totalEvaluations,
    };
  }, [performanceData, selectedSubjectId]);

  useEffect(() => {
    if (instructorID && instructorsWithSubjects.length > 0) {
      const inst = instructorsWithSubjects.find((i) => String(i.in_instructorID) === instructorID);
      setSelectedInstructor(inst || null);
      if (!inst) navigate("/adm-instructor-list");
    } else {
      setSelectedInstructor(null);
    }
    setSelectedSubjectId(null);
  }, [instructorID, instructorsWithSubjects, navigate]);


  const filteredInstructors = instructorsWithSubjects.filter((inst) => {
    if (filterCourse !== "All" && !inst.subjects.some(sub => sub.sb_course === filterCourse)) return false;
    if (filterYear !== "All" && !inst.subjects.some(sub => String(sub.sb_year) === filterYear)) return false;
    if (filterSemester !== "All" && !inst.subjects.some(sub => String(sub.sb_semester) === filterSemester)) return false;
    const query = searchQuery.toLowerCase();
    const name = `${inst.in_fname} ${inst.in_lname}`.toLowerCase();
    return name.includes(query) || inst.in_dept.toLowerCase().includes(query);
  });

  const handleOpenModal = (inst) => navigate(`/adm-instructor-list/${inst.in_instructorID}`);
  const handleCloseModal = () => navigate("/adm-instructor-list");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminNavBar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Instructor Directory</h1>

        {/* --- Search and Filters Section --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
          <input type="text" placeholder="Search by name or department..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-1/2 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500" />
          <div className="flex flex-wrap gap-3">
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"><option value="All">All Courses</option><option value="BSIT">BSIT</option><option value="BSIS">BSIS</option></select>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"><option value="All">All Years</option><option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option></select>
            <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"><option value="All">All Semesters</option><option value="1">1st Semester</option><option value="2">2nd Semester</option><option value="3">Summer</option></select>
          </div>
        </div>


        {/* --- Instructors Grid Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((inst) => (
            <div key={inst.in_instructorID} className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition-shadow duration-300" onClick={() => handleOpenModal(inst)}>
              <div className="flex items-center space-x-4"><img src={inst.face || "/profiles/profile-default.png"} alt={`${inst.in_fname} ${inst.in_lname}`} className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"/>
                <div>
                  <p className="font-semibold text-lg">{`${inst.in_fname} ${inst.in_mname ? inst.in_mname[0] + "." : ""} ${inst.in_lname} ${inst.in_suffix}`}</p>
                  <p className="text-gray-500 text-sm">{inst.in_dept}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t">
                <p className="text-xs font-bold text-gray-500 mb-2">SUBJECTS</p>
                <div className="space-y-1">
                  {inst.subjects.slice(0, 2).map((sub) => (<div key={sub.sb_subID} className="text-sm text-gray-600 truncate">{sub.sb_name}</div>))}
                  {inst.subjects.length > 2 && (<p className="text-xs text-gray-400 mt-1">+{inst.subjects.length - 2} more subjects</p>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- MODAL --- */}
        {selectedInstructor && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl p-1" onClick={handleCloseModal}>&times;</button>

              <header className="flex items-center space-x-6 mb-6 pb-6 border-b"><img src={selectedInstructor.face || "/profiles/profile-default.png"} alt={`${selectedInstructor.in_fname} ${selectedInstructor.in_lname}`} className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"/>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{`${selectedInstructor.in_fname} ${selectedInstructor.in_mname ? selectedInstructor.in_mname[0] + "." : ""} ${selectedInstructor.in_lname} ${selectedInstructor.in_suffix}`}</h2>
                  <p className="text-gray-600 text-lg">{selectedInstructor.in_dept}</p>
                </div>
              </header>

              <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <aside className="lg:col-span-1 space-y-4">
                  <InfoCard title="Personal Information">
                      <p><strong>Full Name:</strong> {`${selectedInstructor.in_fname} ${selectedInstructor.in_mname} ${selectedInstructor.in_lname} ${selectedInstructor.in_suffix}`}</p>
                      <p><strong>Date of Birth:</strong> {selectedInstructor.in_dob}</p>
                      <p><strong>Sex:</strong> {selectedInstructor.in_sex === 'M' ? 'Male' : 'Female'}</p>
                  </InfoCard>
                   <InfoCard title="Contact Details">
                      <p><strong>Email:</strong> <a href={`mailto:${selectedInstructor.in_email}`} className="text-blue-600 hover:underline">{selectedInstructor.in_email}</a></p>
                      <p><strong>Contact #:</strong> {selectedInstructor.in_cnum}</p>
                  </InfoCard>
                </aside>

                <section className="lg:col-span-2">
                   <h3 className="text-xl font-semibold mb-3 text-slate-800">Performance Metrics</h3>
                   <div className="flex flex-wrap gap-2 mb-4">
                       <button onClick={() => setSelectedSubjectId(null)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${!selectedSubjectId ? "bg-blue-600 text-white font-bold" : "bg-gray-200 hover:bg-gray-300"}`}>Overall Performance</button>
                       {selectedInstructor.subjects.map((sub) => (
                           <button key={sub.sb_subID} onClick={() => setSelectedSubjectId(sub.sb_subID)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedSubjectId === sub.sb_subID ? "bg-blue-600 text-white font-bold" : "bg-gray-200 hover:bg-gray-300"}`}>{sub.sb_name}</button>
                       ))}
                   </div>

                   {/* --- UPDATED Performance Display --- */}
                   {displayedData ? (() => {
                      const remarksSummary = analyzeRemarks(displayedData.remarks);
                      return (
                        <div className="bg-slate-50 p-4 rounded-lg">
                           <p className="font-bold text-slate-700 mb-4">{selectedSubjectId ? `Results for ${subjectLoad.find(s => s.sb_subID === selectedSubjectId)?.sb_name}`: "Overall Summary"}
                             <span className="text-sm font-normal text-slate-500 ml-2">({displayedData.totalReviews} reviews)</span>
                           </p>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Column 1: Scores */}
                              <div className="space-y-3">
                                {Object.entries(displayedData.averageCategoryScores).map(([category, score]) => (
                                    <ScoreBar key={category} category={category} score={parseFloat(score)} />
                                ))}
                              </div>
                              {/* Column 2: Remarks */}
                              <div>
                                {remarksSummary && <RemarksSummary summary={remarksSummary} />}
                                <ul className="space-y-2 h-32 overflow-y-auto bg-white p-2 rounded border custom-scrollbar">
                                  {displayedData.remarks && displayedData.remarks.filter(r => r && r.trim()).length > 0 ? (
                                    displayedData.remarks.filter(r => r && r.trim()).map((remark, index) => (
                                      <li key={index} className="text-sm italic text-gray-600 border-l-2 border-slate-300 pl-2">"{remark}"</li>
                                    ))
                                  ) : (
                                    <EmptyState message="No remarks available for this view."/>
                                  )}
                                </ul>
                              </div>
                           </div>
                        </div>
                      );
                   })()
                   : (
                     <EmptyState message="No performance data available for this instructor yet." />
                   )}
                </section>
              </main>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminInstructorList;