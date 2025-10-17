import React, { useState, useEffect } from "react";
import StudentNavBar from "../../components/module_layout/StudentNavBar";
import { FiSearch, FiFilter, FiEye, FiCalendar, FiUser, FiBook, FiStar, FiChevronDown, FiChevronUp } from "react-icons/fi";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export default function EvaluationHistory() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    semester: "All",
    subject: "All",
    instructor: "All"
  });
  const [expandedEvaluation, setExpandedEvaluation] = useState(null);
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    averageRating: 0,
    recentEvaluations: 0
  });

  const userString = sessionStorage.getItem("user");
  const student = userString ? JSON.parse(userString) : null;
  const studentId = student?.stud_id;

  useEffect(() => {
    if (studentId) {
      fetchEvaluationHistory();
    }
  }, [studentId]);

  // Helper function to normalize field names (handles PostgreSQL lowercase conversion)
  const normalizeEvaluationData = (evaluationsData) => {
    return evaluationsData.map(evaluation => {
      // Create a normalized object with consistent field names
      const normalized = { ...evaluation };
      
      // Map possible field name variations to consistent names
      normalized.ev_C1 = evaluation.ev_C1 || evaluation.ev_c1 || evaluation.ev_c_1;
      normalized.ev_C2 = evaluation.ev_C2 || evaluation.ev_c2 || evaluation.ev_c_2;
      normalized.ev_C3 = evaluation.ev_C3 || evaluation.ev_c3 || evaluation.ev_c_3;
      normalized.ev_C4 = evaluation.ev_C4 || evaluation.ev_c4 || evaluation.ev_c_4;
      normalized.ev_C5 = evaluation.ev_C5 || evaluation.ev_c5 || evaluation.ev_c_5;
      
      return normalized;
    });
  };

  const fetchEvaluationHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/evaluations/student/${studentId}`);
      let evaluationsData = response.data;
      
      console.log("Raw API response:", evaluationsData);
      if (evaluationsData.length > 0) {
        console.log("First evaluation fields:", Object.keys(evaluationsData[0]));
      }
      
      // Normalize the data to handle field name variations
      evaluationsData = normalizeEvaluationData(evaluationsData);
      
      setEvaluations(evaluationsData);
      calculateStats(evaluationsData);
    } catch (error) {
      console.error("Error fetching evaluation history:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (evaluationsData) => {
    const totalEvaluations = evaluationsData.length;
    
    let totalRatingSum = 0;
    let validRatingsCount = 0;
    
    evaluationsData.forEach(evalItem => {
      const rating = parseFloat(evalItem.ev_total_rating);
      if (!isNaN(rating) && rating > 0) {
        totalRatingSum += rating;
        validRatingsCount++;
      }
    });
    
    const averageRating = validRatingsCount > 0 ? totalRatingSum / validRatingsCount : 0;

    const currentSemester = student?.stud_semester;
    const recentEvaluations = evaluationsData.filter(evalItem => 
      evalItem.ev_semester === currentSemester
    ).length;

    setStats({
      totalEvaluations,
      averageRating: parseFloat(averageRating.toFixed(2)),
      recentEvaluations
    });
  };

  // Filter evaluations based on search and filters
  const filteredEvaluations = evaluations.filter(evaluation => {
    const searchLower = searchQuery.toLowerCase();
    const instructorName = `${evaluation.ins_fname || ''} ${evaluation.ins_lname || ''}`.trim();
    const subjectName = evaluation.subject_name || evaluation.ev_subject || '';
    
    const matchesSearch = 
      subjectName.toLowerCase().includes(searchLower) ||
      instructorName.toLowerCase().includes(searchLower);

    const matchesSemester = filters.semester === "All" || (evaluation.ev_semester?.toString() === filters.semester);
    const matchesSubject = filters.subject === "All" || (subjectName === filters.subject);
    const matchesInstructor = filters.instructor === "All" || instructorName.includes(filters.instructor);

    return matchesSearch && matchesSemester && matchesSubject && matchesInstructor;
  });

  // Get unique values for filter dropdowns
  const getUniqueSemesters = () => {
    const semesters = evaluations.map(evalItem => evalItem.ev_semester?.toString());
    return [...new Set(semesters)].filter(Boolean).sort();
  };

  const getUniqueSubjects = () => {
    const subjects = evaluations.map(evalItem => evalItem.subject_name || evalItem.ev_subject);
    return [...new Set(subjects)].filter(Boolean).sort();
  };

  const getUniqueInstructors = () => {
    const instructors = evaluations.map(evalItem => 
      `${evalItem.ins_fname || ''} ${evalItem.ins_lname || ''}`.trim()
    );
    return [...new Set(instructors)].filter(Boolean).sort();
  };

  const toggleEvaluationDetails = (evalId) => {
    setExpandedEvaluation(expandedEvaluation === evalId ? null : evalId);
  };

  const getRatingColor = (rating) => {
    if (!rating || isNaN(rating)) return "text-gray-600 bg-gray-100";
    if (rating >= 4.5) return "text-green-600 bg-green-100";
    if (rating >= 4.0) return "text-blue-600 bg-blue-100";
    if (rating >= 3.0) return "text-yellow-600 bg-yellow-100";
    if (rating >= 2.0) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getRatingLabel = (rating) => {
    if (!rating || isNaN(rating)) return "No Rating";
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.0) return "Good";
    if (rating >= 2.0) return "Fair";
    return "Poor";
  };

  const formatRating = (rating) => {
    if (!rating || isNaN(rating)) return "N/A";
    return parseFloat(rating).toFixed(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-600">Access Denied. Please log in.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <StudentNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading evaluation history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <StudentNavBar />

      <main className="flex-1 p-4 md:p-8 max-w-screen-xl mx-auto w-full">
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Evaluation History</h1>
          <p className="mt-1 text-gray-500">
            View your submitted faculty evaluations and ratings
          </p>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Evaluations</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalEvaluations}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiBook className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-800">{stats.averageRating}/5.0</p>
                <p className="text-sm text-gray-500">
                  {getRatingLabel(stats.averageRating)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiStar className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Semester</p>
                <p className="text-2xl font-bold text-gray-800">{stats.recentEvaluations}</p>
                <p className="text-sm text-gray-500">Semester {student.stud_semester}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiCalendar className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by subject, instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select
                value={filters.semester}
                onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Semesters</option>
                {getUniqueSemesters().map(semester => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All Subjects</option>
                {getUniqueSubjects().map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              {filteredEvaluations.length} evaluation{filteredEvaluations.length !== 1 ? 's' : ''} found
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilters({ semester: "All", subject: "All", instructor: "All" });
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Evaluations List */}
        <div className="space-y-4">
          {filteredEvaluations.length > 0 ? (
            filteredEvaluations.map((evaluation) => {
              const instructorName = `${evaluation.ins_fname || ''} ${evaluation.ins_lname || ''}`.trim();
              const subjectName = evaluation.subject_name || evaluation.ev_subject || 'Unknown Subject';
              const totalRating = evaluation.ev_total_rating;
              
              return (
                <div key={evaluation.ev_id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  {/* Evaluation Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                    onClick={() => toggleEvaluationDetails(evaluation.ev_id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {subjectName}
                          </h3>
                          {totalRating && (
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getRatingColor(totalRating)}`}>
                              {formatRating(totalRating)}/5.0 • {getRatingLabel(totalRating)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiUser className="text-blue-500" />
                            <span>{instructorName || 'Unknown Instructor'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiCalendar className="text-green-500" />
                            <span>Semester {evaluation.ev_semester || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiStar className="text-yellow-500" />
                            <span>Submitted {formatDate(evaluation.ev_date)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {expandedEvaluation === evaluation.ev_id ? (
                          <FiChevronUp className="text-gray-400" />
                        ) : (
                          <FiChevronDown className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedEvaluation === evaluation.ev_id && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Rating Breakdown */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Rating Breakdown</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">C1: Subject Knowledge</span>
                              <span className="font-medium text-gray-800">{formatRating(evaluation.ev_C1)}/5.0</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">C2: Teaching Methods</span>
                              <span className="font-medium text-gray-800">{formatRating(evaluation.ev_C2)}/5.0</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">C3: Classroom Management</span>
                              <span className="font-medium text-gray-800">{formatRating(evaluation.ev_C3)}/5.0</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">C4: Communication Skills</span>
                              <span className="font-medium text-gray-800">{formatRating(evaluation.ev_C4)}/5.0</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">C5: Professionalism</span>
                              <span className="font-medium text-gray-800">{formatRating(evaluation.ev_C5)}/5.0</span>
                            </div>
                          </div>
                        </div>

                        {/* Additional Information */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Evaluation Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Evaluation ID:</span>
                              <span className="font-medium">#{evaluation.ev_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subject Code:</span>
                              <span className="font-medium">{evaluation.sub_miscode || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Instructor Department:</span>
                              <span className="font-medium">{evaluation.ins_dept || 'N/A'}</span>
                            </div>
                            {evaluation.ev_remark && (
                              <div>
                                <span className="text-gray-600 block mb-1">Additional Remarks:</span>
                                <p className="text-gray-800 bg-white p-2 rounded border text-xs">
                                  {evaluation.ev_remark}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <FiEye className="mx-auto text-4xl mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {evaluations.length === 0 ? "No evaluations submitted yet" : "No evaluations match your filters"}
              </h3>
              <p className="text-gray-500 mb-4">
                {evaluations.length === 0 
                  ? "Start evaluating your instructors to see your history here." 
                  : "Try adjusting your search criteria or filters."
                }
              </p>
              {evaluations.length === 0 && (
                <a
                  href="/instructor-list"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150"
                >
                  Start Evaluating
                </a>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white text-center py-4 border-t border-gray-200 mt-8">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)
        </p>
      </footer>
    </div>
  );
}