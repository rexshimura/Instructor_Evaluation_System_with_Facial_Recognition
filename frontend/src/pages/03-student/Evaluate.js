import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavBar from "../../components/module_layout/StudentNavBar";
import axios from "axios";
// Added FiSearch for the search bar
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";

const semesterMap = {
  1: "1st Semester",
  2: "2nd Semester",
  3: "Summer",
};

export default function StudentInstructorListPage() {
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [evaluations, setEvaluations] = useState([]);
  const [studentSections, setStudentSections] = useState([]);
  const [sectionAssignments, setSectionAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  const student = useMemo(() => {
    const userString = sessionStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }, []);

  useEffect(() => {
    if (student) {
      fetchStudentData();
    }
  }, [student]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [evaluationsRes, studentSectionsRes, sectionAssignmentsRes] = await Promise.all([
        axios.get(`/evaluations/student/${student.stud_id}`),
        axios.get(`/student-sections/student/${student.stud_id}`),
        axios.get('/section-assignments')
      ]);

      setEvaluations(evaluationsRes.data || []);
      setStudentSections(studentSectionsRes.data || []);
      setSectionAssignments(sectionAssignmentsRes.data || []);

    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const safeIdCompare = (id1, id2) => {
    if (id1 === undefined || id1 === null || id2 === undefined || id2 === null) {
      return false;
    }
    return id1.toString() === id2.toString();
  };

  const alignedInstructors = useMemo(() => {
    const getEvaluableInstructors = () => {
      try {
        if (!studentSections || !Array.isArray(studentSections) || studentSections.length === 0) return [];
        if (!sectionAssignments || !Array.isArray(sectionAssignments) || sectionAssignments.length === 0) return [];

        const evaluableInstructors = [];

        studentSections.forEach((studentSection) => {
          if (!studentSection || !studentSection.section_id) return;

          const sectionAssignmentsList = sectionAssignments.filter(assignment => {
            if (!assignment || !assignment.section_id) return false;
            return safeIdCompare(assignment.section_id, studentSection.section_id);
          });

          sectionAssignmentsList.forEach((assignment) => {
            if (!assignment || !assignment.ins_id || !assignment.sub_id) return;

            const {
              ins_id: instructor_id,
              ins_fname, ins_lname, ins_dept, ins_email, ins_contact,
              sub_id: subject_id,
              sub_name: subject_name,
              sub_miscode,
              sub_course: subject_course,
              sub_units
            } = assignment;

            const isEvaluated = evaluations.some(evaluation => {
              if (!evaluation) return false;
              const insMatch = safeIdCompare(evaluation.ins_id, instructor_id);
              const subMatch = safeIdCompare(evaluation.sub_id, subject_id);
              const semesterMatch = evaluation.ev_semester === student.stud_semester;
              return insMatch && subMatch && semesterMatch;
            });

            let existingInstructor = evaluableInstructors.find(
              inst => inst && safeIdCompare(inst.instructor_id, instructor_id)
            );

            const subjectInfo = {
              subject_id,
              subject_name: subject_name || 'Unknown Subject',
              sub_miscode: sub_miscode || 'N/A',
              subject_course: subject_course || 'Unknown Course',
              sub_units: sub_units || 0,
              section_id: studentSection.section_id,
              section_name: studentSection.sect_name || 'Unknown Section',
              isEvaluated
            };

            if (existingInstructor) {
              existingInstructor.subjects.push(subjectInfo);
              if (!isEvaluated) existingInstructor.isAnySubjectPending = true;
            } else {
              const newInstructor = {
                instructor_id,
                instructor_name: `${ins_fname || ''} ${ins_lname || ''}`.trim(),
                ins_fname: ins_fname || 'Unknown',
                ins_lname: ins_lname || 'Instructor',
                ins_dept: ins_dept || 'Unknown Department',
                ins_email: ins_email || 'No email',
                ins_contact: ins_contact || 'No contact',
                subjects: [subjectInfo],
                isAnySubjectPending: !isEvaluated
              };
              evaluableInstructors.push(newInstructor);
            }
          });
        });
        return evaluableInstructors;
      } catch (error) {
        console.error("Error in getEvaluableInstructors:", error);
        return [];
      }
    };
    return getEvaluableInstructors();
  }, [studentSections, sectionAssignments, evaluations, student]);

  const filteredInstructors = useMemo(() => {
    return alignedInstructors.filter((inst) => {
      if (!inst) return false;

      const searchLower = searchTerm.toLowerCase();
      const fullName = `${inst.ins_fname || ''} ${inst.ins_lname || ''}`.toLowerCase();

      const subjectMatch = inst.subjects && inst.subjects.some(
        (sub) =>
          sub && (
            (sub.subject_name && sub.subject_name.toLowerCase().includes(searchLower)) ||
            (sub.sub_miscode && sub.sub_miscode.toLowerCase().includes(searchLower))
          )
      );

      const matchesSearch = fullName.includes(searchLower) || subjectMatch;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "pending"
            ? inst.isAnySubjectPending
            : !inst.isAnySubjectPending;

      return matchesSearch && matchesStatus;
    });
  }, [alignedInstructors, searchTerm, statusFilter]);

  // --- Pagination Logic ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInstructors = filteredInstructors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEvaluateClick = (instructorId, subjectId) => {
    if (!instructorId || !subjectId) {
      console.error("Invalid instructorId or subjectId:", instructorId, subjectId);
      return;
    }
    navigate(`/instructor-evaluation/${instructorId}/${subjectId}`);
  };

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col">
        <StudentNavBar />
        <main className="flex-1 flex items-center justify-center text-red-500 text-lg">
          Please log in to view instructors.
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StudentNavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <StudentNavBar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-500 text-lg">{error}</div>
          <button
            onClick={fetchStudentData}
            className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StudentNavBar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">

        {/* --- IMPROVED HEADER SECTION --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Faculty Evaluation</h1>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium text-gray-700">{student.stud_fname} {student.stud_lname}</span> • {semesterMap[student.stud_semester]}
              </p>
            </div>

            {/* Styled Status Filters (Segmented Control) */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {["all", "pending", "completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 capitalize ${
                    statusFilter === status
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Improved Search Bar */}
          <div className="relative max-w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search instructor name, subject code, or department..."
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {/* --- END IMPROVED HEADER SECTION --- */}

        {/* --- Pagination Controls --- */}
        {filteredInstructors.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-6 border border-gray-200 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredInstructors.length)}</span> of <span className="font-medium">{filteredInstructors.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  <div className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>

            {/* Mobile Pagination View */}
            <div className="flex sm:hidden justify-between w-full">
              <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50 bg-white">Previous</button>
              <span className="text-sm py-2">Page {currentPage}</span>
              <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50 bg-white">Next</button>
            </div>
          </div>
        )}

        {filteredInstructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentInstructors.map((inst) => (
              <div
                key={inst.instructor_id}
                className="relative bg-white shadow-sm border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
                onClick={() => setSelectedInstructor(inst)}
              >
                <div className="flex items-center space-x-4 border-b border-gray-100 pb-4 mb-4">
                  <div className="relative">
                    <img
                      src="/profiles/profile-default.png"
                      alt={`${inst.ins_fname} ${inst.ins_lname}`}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 group-hover:border-blue-100 transition-colors"
                    />
                    {!inst.isAnySubjectPending && (
                      <span className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full" title="All Completed"></span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                      {inst.ins_fname} {inst.ins_lname}
                    </p>
                    <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold">{inst.ins_dept}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {inst.subjects && inst.subjects.slice(0, 3).map((sub, idx) => (
                    <div
                      key={`${inst.instructor_id}-${sub.subject_id}-${idx}`}
                      className="text-sm flex justify-between items-center p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-medium text-gray-700 truncate" title={sub.subject_name}>
                           {sub.sub_miscode}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {sub.section_name}
                        </p>
                      </div>
                      {sub.isEvaluated ? (
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold border border-green-100">
                          DONE
                        </span>
                      ) : (
                        <button
                          className="bg-blue-600 text-white text-xs font-semibold py-1 px-3 rounded-md hover:bg-blue-700 shadow-sm transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEvaluateClick(inst.instructor_id, sub.subject_id);
                          }}
                        >
                          Evaluate
                        </button>
                      )}
                    </div>
                  ))}
                  {inst.subjects && inst.subjects.length > 3 && (
                     <p className="text-center text-xs text-gray-400 mt-1">+{inst.subjects.length - 3} more subjects</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-12 bg-white p-12 rounded-xl border border-gray-200 border-dashed">
             <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
               <FiSearch size={48} />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No instructors found</h3>
             <p className="text-gray-500 mt-1 mb-6">We couldn't find any instructors matching your search.</p>
             <button
                  onClick={fetchStudentData}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Refresh Data
             </button>
          </div>
        )}
      </main>

      {/* Modal Logic Remains Unchanged */}
      {selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-0 relative max-h-[90vh] overflow-y-auto transform transition-all scale-100">

            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
               <div className="flex items-center space-x-4">
                  <img
                    src="/profiles/profile-default.png"
                    alt={`${selectedInstructor.ins_fname} ${selectedInstructor.ins_lname}`}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedInstructor.ins_fname} {selectedInstructor.ins_lname}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">{selectedInstructor.ins_dept}</p>
                  </div>
               </div>
               <button
                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 rounded-full p-2 transition-all"
                onClick={() => setSelectedInstructor(null)}
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                Subject Load
              </h3>
              <div className="space-y-3">
                {selectedInstructor.subjects && selectedInstructor.subjects.map((sub, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-200 transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">
                          {sub.sub_miscode}
                        </p>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sub.section_name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {sub.subject_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sub.subject_course} • {sub.sub_units} units
                      </p>
                    </div>
                    <button
                      disabled={sub.isEvaluated}
                      className={
                        sub.isEvaluated
                          ? "w-full sm:w-auto bg-green-50 text-green-700 border border-green-200 font-semibold py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                          : "w-full sm:w-auto bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                      }
                      onClick={() =>
                        !sub.isEvaluated &&
                        handleEvaluateClick(selectedInstructor.instructor_id, sub.subject_id)
                      }
                    >
                      {sub.isEvaluated ? (
                        <>
                          <span>✓ Completed</span>
                        </>
                      ) : "Evaluate Now"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}