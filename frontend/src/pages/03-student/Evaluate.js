import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavBar from "../../components/module_layout/StudentNavBar";
import axios from "axios";

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

  // FIX 1: Memoize the student object to prevent infinite re-renders
  const student = useMemo(() => {
    const userString = sessionStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }, []); // Empty dependency array means this runs only once

  useEffect(() => {
    if (student) {
      fetchStudentData();
    }
  }, [student]); // Now student reference is stable

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching data for student:", student.stud_id);
      
      const [evaluationsRes, studentSectionsRes, sectionAssignmentsRes] = await Promise.all([
        axios.get(`/evaluations/student/${student.stud_id}`),
        axios.get(`/student-sections/student/${student.stud_id}`),
        axios.get('/section-assignments')
      ]);

      console.log("Raw Evaluations:", evaluationsRes.data);
      console.log("Raw Student Sections:", studentSectionsRes.data);
      console.log("Raw Section Assignments:", sectionAssignmentsRes.data);

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

  // Safe ID comparison function
  const safeIdCompare = (id1, id2) => {
    if (id1 === undefined || id1 === null || id2 === undefined || id2 === null) {
      return false;
    }
    return id1.toString() === id2.toString();
  };

  // FIX 2: Memoize the expensive instructor calculation
  const alignedInstructors = useMemo(() => {
    const getEvaluableInstructors = () => {
      try {
        console.log("Starting getEvaluableInstructors...");
        console.log("Student Sections:", studentSections);
        console.log("Section Assignments:", sectionAssignments);
        console.log("Evaluations:", evaluations);

        if (!studentSections || !Array.isArray(studentSections) || studentSections.length === 0) {
          console.log("No student sections available");
          return [];
        }

        if (!sectionAssignments || !Array.isArray(sectionAssignments) || sectionAssignments.length === 0) {
          console.log("No section assignments available");
          return [];
        }

        const evaluableInstructors = [];

        // For each section the student is enrolled in
        studentSections.forEach((studentSection, sectionIndex) => {
          console.log(`Processing student section ${sectionIndex}:`, studentSection);
          
          if (!studentSection || !studentSection.section_id) {
            console.log("Invalid student section, skipping:", studentSection);
            return;
          }

          // Find all assignments for this section
          const sectionAssignmentsList = sectionAssignments.filter(assignment => {
            if (!assignment || !assignment.section_id) {
              console.log("Invalid assignment, skipping:", assignment);
              return false;
            }
            return safeIdCompare(assignment.section_id, studentSection.section_id);
          });

          console.log(`Section ${studentSection.section_id} assignments:`, sectionAssignmentsList);

          // Process each assignment to get instructor-subject combinations
          sectionAssignmentsList.forEach((assignment, assignmentIndex) => {
            console.log(`Processing assignment ${assignmentIndex}:`, assignment);
            
            if (!assignment || !assignment.ins_id || !assignment.sub_id) {
              console.log("Invalid assignment data, skipping:", assignment);
              return;
            }

            const {
              ins_id: instructor_id,
              ins_fname,
              ins_lname,
              ins_dept,
              ins_email,
              ins_contact,
              sub_id: subject_id,
              sub_name: subject_name,
              sub_miscode,
              sub_course: subject_course,
              sub_units
            } = assignment;

            // Check if this instructor-subject combination is already evaluated
            const isEvaluated = evaluations.some(evaluation => {
              if (!evaluation) return false;
              
              const insMatch = safeIdCompare(evaluation.ins_id, instructor_id);
              const subMatch = safeIdCompare(evaluation.sub_id, subject_id);
              const semesterMatch = evaluation.ev_semester === student.stud_semester;
              
              console.log(`Evaluation check: insMatch=${insMatch}, subMatch=${subMatch}, semesterMatch=${semesterMatch}`);
              return insMatch && subMatch && semesterMatch;
            });

            console.log(`Instructor ${instructor_id}, Subject ${subject_id} - Evaluated: ${isEvaluated}`);

            // Find existing instructor or create new one
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
              // Add subject to existing instructor
              existingInstructor.subjects.push(subjectInfo);
              // Update pending status
              if (!isEvaluated) {
                existingInstructor.isAnySubjectPending = true;
              }
            } else {
              // Create new instructor entry
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

        console.log("Final evaluable instructors:", evaluableInstructors);
        return evaluableInstructors;

      } catch (error) {
        console.error("Error in getEvaluableInstructors:", error);
        return [];
      }
    };

    return getEvaluableInstructors();
  }, [studentSections, sectionAssignments, evaluations, student]);

  // Memoize filtered instructors for better performance
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
          <div className="text-gray-500 text-lg">Loading instructors...</div>
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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <StudentNavBar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Instructors for {student.stud_fname} {student.stud_lname} -{" "}
          {semesterMap[student.stud_semester]}
        </h1>

        <div className="flex justify-center gap-3 mb-6">
          {["all", "pending", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold ${
                statusFilter === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search by name, subject, or code..."
            className="w-full max-w-md p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Debug Information */}
        <div className="text-xs text-gray-500 mb-4 text-center">
          Debug: {studentSections.length} sections, {sectionAssignments.length} assignments, {evaluations.length} evaluations, {filteredInstructors.length} instructors to display
        </div>

        {filteredInstructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstructors.map((inst) => (
              <div
                key={inst.instructor_id}
                className="relative bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
                onClick={() => setSelectedInstructor(inst)}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src="/profiles/profile-default.png"
                    alt={`${inst.ins_fname} ${inst.ins_lname}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                  />
                  <div>
                    <p className="font-semibold text-lg">
                      {inst.ins_fname} {inst.ins_lname}
                    </p>
                    <p className="text-gray-500 text-sm">{inst.ins_dept}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {inst.subjects && inst.subjects.map((sub, idx) => (
                    <div
                      key={`${inst.instructor_id}-${sub.subject_id}-${idx}`}
                      className="text-sm text-gray-600 flex justify-between items-center bg-gray-50 p-2 rounded"
                    >
                      <div>
                        {sub.subject_name} ({sub.sub_miscode})
                        <br />
                        <span className="text-xs text-gray-500">
                          Section: {sub.section_name}
                        </span>
                      </div>
                      {sub.isEvaluated ? (
                        <span className="bg-green-500 text-white font-bold py-1 px-2 rounded text-xs">
                          Completed
                        </span>
                      ) : (
                        <button
                          className="bg-blue-500 text-white font-bold py-1 px-2 rounded hover:bg-blue-600 transition text-xs"
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            {studentSections.length > 0 ? (
              <div>
                <p>No instructors found for your sections.</p>
                <p className="text-sm mt-2">
                  You are enrolled in {studentSections.length} section(s) but no instructor assignments were found.
                </p>
                <button 
                  onClick={fetchStudentData}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div>
                <p>You are not enrolled in any sections yet.</p>
                <p className="text-sm mt-2">
                  Please contact administration to be assigned to a section.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl"
              onClick={() => setSelectedInstructor(null)}
            >
              &times;
            </button>
            <div className="flex items-center space-x-4 mb-6">
              <img
                src="/profiles/profile-default.png"
                alt={`${selectedInstructor.ins_fname} ${selectedInstructor.ins_lname}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedInstructor.ins_fname} {selectedInstructor.ins_lname}
                </h2>
                <p className="text-gray-600">{selectedInstructor.ins_dept}</p>
                <p className="text-gray-600">{selectedInstructor.ins_email}</p>
                <p className="text-gray-600">{selectedInstructor.ins_contact}</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 border-b pb-2">
              Subject Load
            </h3>
            <div className="space-y-4">
              {selectedInstructor.subjects && selectedInstructor.subjects.map((sub, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-3 rounded-md border flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {sub.subject_name} ({sub.sub_miscode})
                    </p>
                    <p className="text-sm text-gray-600">
                      {sub.subject_course} - {sub.sub_units} units
                    </p>
                    <p className="text-sm text-gray-600">
                      Section: {sub.section_name}
                    </p>
                  </div>
                  <button
                    disabled={sub.isEvaluated}
                    className={
                      sub.isEvaluated
                        ? "bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
                        : "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition"
                    }
                    onClick={() =>
                      !sub.isEvaluated &&
                      handleEvaluateClick(selectedInstructor.instructor_id, sub.subject_id)
                    }
                  >
                    {sub.isEvaluated ? "Evaluated" : "Evaluate"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}