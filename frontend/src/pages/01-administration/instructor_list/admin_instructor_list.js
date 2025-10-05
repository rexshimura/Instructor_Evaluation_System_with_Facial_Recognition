import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavBar from "../../../components/module_layout/AdminNavBar";

// --- Utility Import ---
import analyzeRemarks from "../../../utils/remarkAnalyzer";

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

// Updated performance calculation for database structure
const calculatePerformance = (evaluations, instructorID) => {
  if (!evaluations || evaluations.length === 0) {
    return {
      performanceBySubject: {},
      overallAverageCategoryScores: {
        "Course Organization and Content": "0.00",
        "Instructor's Knowledge and Presentation": "0.00",
        "Communication and Interaction": "0.00",
        "Assessment and Feedback": "0.00",
        "Overall Effectiveness": "0.00"
      },
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
      overallAverageCategoryScores: {
        "Course Organization and Content": "0.00",
        "Instructor's Knowledge and Presentation": "0.00",
        "Communication and Interaction": "0.00",
        "Assessment and Feedback": "0.00",
        "Overall Effectiveness": "0.00"
      },
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
        totalScores: {
          "Course Organization and Content": { total: 0, count: 0 },
          "Instructor's Knowledge and Presentation": { total: 0, count: 0 },
          "Communication and Interaction": { total: 0, count: 0 },
          "Assessment and Feedback": { total: 0, count: 0 },
          "Overall Effectiveness": { total: 0, count: 0 }
        }
      };
    }

    performanceBySubject[ev_subject].evaluations.push(evaluation);
    
    if (ev_remark) {
      performanceBySubject[ev_subject].remarks.push(ev_remark);
      allRemarks.push(ev_remark);
    }

    // Map database columns to categories
    const categoryScores = {
      "Course Organization and Content": ev_c1,
      "Instructor's Knowledge and Presentation": ev_c2,
      "Communication and Interaction": ev_c3,
      "Assessment and Feedback": ev_c4,
      "Overall Effectiveness": ev_c5
    };

    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score !== null && score !== undefined) {
        performanceBySubject[ev_subject].totalScores[category].total += parseFloat(score);
        performanceBySubject[ev_subject].totalScores[category].count += 1;
      }
    });
  });

  // Calculate averages per subject
  for (const subjectId in performanceBySubject) {
    const subjectData = performanceBySubject[subjectId];
    subjectData.averageCategoryScores = {};
    for (const category in subjectData.totalScores) {
      const { total, count } = subjectData.totalScores[category];
      subjectData.averageCategoryScores[category] = count > 0 ? (total / count).toFixed(2) : "0.00";
    }
  }

  // Calculate overall averages
  const overallTotalScores = {
    "Course Organization and Content": { total: 0, count: 0 },
    "Instructor's Knowledge and Presentation": { total: 0, count: 0 },
    "Communication and Interaction": { total: 0, count: 0 },
    "Assessment and Feedback": { total: 0, count: 0 },
    "Overall Effectiveness": { total: 0, count: 0 }
  };

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

const AdminInstructorList = () => {
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterSemester, setFilterSemester] = useState("All");
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for dynamic data
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const { instructorID } = useParams();
  const navigate = useNavigate();

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [instructorsRes, subjectsRes, evaluationsRes] = await Promise.all([
          fetch("http://localhost:5000/instructor_list"),
          fetch("http://localhost:5000/subject_list"),
          fetch("http://localhost:5000/evaluations")
        ]);

        const instructorsData = await instructorsRes.json();
        const subjectsData = await subjectsRes.json();
        const evaluationsData = await evaluationsRes.json();

        if (instructorsData.error) throw new Error(instructorsData.error);
        if (subjectsData.error) throw new Error(subjectsData.error);
        if (evaluationsData.error && evaluationsData.error !== "No evaluations found") {
          throw new Error(evaluationsData.error);
        }

        setInstructors(instructorsData);
        setSubjects(subjectsData);
        setEvaluations(evaluationsData.error ? [] : evaluationsData);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process instructors with their subjects
  const instructorsWithSubjects = useMemo(() => {
    return instructors.map((inst) => {
      const instructorSubjects = subjects.filter((sub) => 
        inst.in_subhandled && inst.in_subhandled.includes(String(sub.sb_subid))
      );
      return { ...inst, subjects: instructorSubjects };
    });
  }, [instructors, subjects]);

  const performanceData = useMemo(() => {
    if (!selectedInstructor) return null;
    return calculatePerformance(evaluations, String(selectedInstructor.in_instructorid));
  }, [selectedInstructor, evaluations]);

  const displayedData = useMemo(() => {
    if (!performanceData) {
      return {
        averageCategoryScores: {
          "Course Organization and Content": "0.00",
          "Instructor's Knowledge and Presentation": "0.00",
          "Communication and Interaction": "0.00",
          "Assessment and Feedback": "0.00",
          "Overall Effectiveness": "0.00"
        },
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
          averageCategoryScores: {
            "Course Organization and Content": "0.00",
            "Instructor's Knowledge and Presentation": "0.00",
            "Communication and Interaction": "0.00",
            "Assessment and Feedback": "0.00",
            "Overall Effectiveness": "0.00"
          },
          remarks: [],
          totalReviews: 0,
          hasEvaluations: false
        };
      }
    }

    return {
      averageCategoryScores: performanceData.overallAverageCategoryScores,
      remarks: performanceData.overallRemarks,
      totalReviews: performanceData.totalEvaluations,
      hasEvaluations: performanceData.hasEvaluations
    };
  }, [performanceData, selectedSubjectId]);

  useEffect(() => {
    if (instructorID && instructorsWithSubjects.length > 0) {
      const inst = instructorsWithSubjects.find((i) => String(i.in_instructorid) === instructorID);
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

  const handleOpenModal = (inst) => navigate(`/adm-instructor-list/${inst.in_instructorid}`);
  const handleCloseModal = () => navigate("/adm-instructor-list");

  const getFullName = (instructor) => {
    if (!instructor) return "";
    const middleInitial = instructor.in_mname ? ` ${instructor.in_mname[0]}.` : "";
    return `${instructor.in_fname}${middleInitial} ${instructor.in_lname} ${instructor.in_suffix || ""}`.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <AdminNavBar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading instructors...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <AdminNavBar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminNavBar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Instructor Directory</h1>

        {/* --- Search and Filters Section --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
          <input 
            type="text" 
            placeholder="Search by name or department..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full md:w-1/2 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500" 
          />
          <div className="flex flex-wrap gap-3">
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500">
              <option value="All">All Courses</option>
              <option value="BSIT">BSIT</option>
              <option value="BSIS">BSIS</option>
            </select>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500">
              <option value="All">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500">
              <option value="All">All Semesters</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">Summer</option>
            </select>
          </div>
        </div>

        {/* --- Instructors Grid Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((inst) => (
            <div key={inst.in_instructorid} className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition-shadow duration-300" onClick={() => handleOpenModal(inst)}>
              <div className="flex items-center space-x-4">
                <img src={inst.face || "/profiles/profile-default.png"} alt={`${inst.in_fname} ${inst.in_lname}`} className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"/>
                <div>
                  <p className="font-semibold text-lg">{getFullName(inst)}</p>
                  <p className="text-gray-500 text-sm">{inst.in_dept}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t">
                <p className="text-xs font-bold text-gray-500 mb-2">SUBJECTS</p>
                <div className="space-y-1">
                  {inst.subjects.slice(0, 2).map((sub) => (
                    <div key={sub.sb_subid} className="text-sm text-gray-600 truncate">{sub.sb_name}</div>
                  ))}
                  {inst.subjects.length > 2 && (
                    <p className="text-xs text-gray-400 mt-1">+{inst.subjects.length - 2} more subjects</p>
                  )}
                  {inst.subjects.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">No subjects assigned</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInstructors.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No instructors found matching your criteria.
          </div>
        )}

        {/* --- MODAL --- */}
        {selectedInstructor && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl p-1" onClick={handleCloseModal}>&times;</button>

              <header className="flex items-center space-x-6 mb-6 pb-6 border-b">
                <img src={selectedInstructor.face || "/profiles/profile-default.png"} alt={`${selectedInstructor.in_fname} ${selectedInstructor.in_lname}`} className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"/>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{getFullName(selectedInstructor)}</h2>
                  <p className="text-gray-600 text-lg">{selectedInstructor.in_dept}</p>
                </div>
              </header>

              <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <aside className="lg:col-span-1 space-y-4">
                  <InfoCard title="Personal Information">
                    <p><strong>Full Name:</strong> {getFullName(selectedInstructor)}</p>
                    <p><strong>Date of Birth:</strong> {new Date(selectedInstructor.in_dob).toLocaleDateString()}</p>
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
                    <button 
                      onClick={() => setSelectedSubjectId(null)} 
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        !selectedSubjectId ? "bg-blue-600 text-white font-bold" : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      Overall Performance
                    </button>
                    {selectedInstructor.subjects.map((sub) => (
                      <button 
                        key={sub.sb_subid} 
                        onClick={() => setSelectedSubjectId(sub.sb_subid)} 
                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                          selectedSubjectId === sub.sb_subid ? "bg-blue-600 text-white font-bold" : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {sub.sb_name}
                      </button>
                    ))}
                  </div>

                  {/* --- UPDATED Performance Display --- */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="font-bold text-slate-700 mb-4">
                      {selectedSubjectId 
                        ? `Results for ${selectedInstructor.subjects.find(s => s.sb_subid === selectedSubjectId)?.sb_name || 'Subject'}`
                        : "Overall Summary"
                      }
                      <span className="text-sm font-normal text-slate-500 ml-2">
                        ({displayedData.totalReviews} reviews)
                        {!displayedData.hasEvaluations && " - No evaluations yet"}
                      </span>
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
                        {displayedData.totalReviews > 0 && (
                          <RemarksSummary summary={analyzeRemarks(displayedData.remarks)} />
                        )}
                        <ul className="space-y-2 h-32 overflow-y-auto bg-white p-2 rounded border custom-scrollbar">
                          {displayedData.remarks && displayedData.remarks.filter(r => r && r.trim()).length > 0 ? (
                            displayedData.remarks.filter(r => r && r.trim()).map((remark, index) => (
                              <li key={index} className="text-sm italic text-gray-600 border-l-2 border-slate-300 pl-2">"{remark}"</li>
                            ))
                          ) : (
                            <EmptyState message={
                              displayedData.hasEvaluations 
                                ? "No remarks available for this view." 
                                : "No evaluations submitted yet."
                            }/>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
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