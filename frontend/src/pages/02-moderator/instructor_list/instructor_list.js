import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import instructors from "../../../data/list-instructors";
import subjectLoad from "../../../data/list-subjects";
import classList from "../../../data/list-class";
import studentData from "../../../data/list-students";

const semesterMap = {
  1: "1st Semester",
  2: "2nd Semester",
  3: "Summer",
};

const InstructorList = () => {
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [expandedSubjectId, setExpandedSubjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterSemester, setFilterSemester] = useState("All");

  const { instructorID, subjectID } = useParams();
  const navigate = useNavigate();

  // `useMemo` prevents this expensive calculation from running on every render.
  // This makes the `instructorsWithSubjects` variable stable, allowing the `useEffect` hook to work correctly.
  const instructorsWithSubjects = useMemo(() => {
    return instructors.map((inst) => {
      const subjects = subjectLoad.filter((sub) =>
        inst.in_subhandled.includes(sub.sb_subID)
      );
      return { ...inst, subjects };
    });
  }, []); // The empty array [] ensures this runs only once.

  useEffect(() => {
    if (instructorID && instructorsWithSubjects.length > 0) {
      const inst = instructorsWithSubjects.find(
        (i) => String(i.in_instructorID) === instructorID
      );
      if (inst) {
        setSelectedInstructor(inst);
        setExpandedSubjectId(subjectID || null);
      } else {
        navigate("/mod-instructor-list");
      }
    } else {
      setSelectedInstructor(null);
      setExpandedSubjectId(null);
    }
  }, [instructorID, subjectID, instructorsWithSubjects, navigate]);

  const filteredInstructors = instructorsWithSubjects.filter((inst) => {
    if (filterCourse !== "All") {
      const teachesCourse = inst.subjects.some(
        (sub) => sub.sb_course === filterCourse
      );
      if (!teachesCourse) return false;
    }
    if (filterYear !== "All") {
      const teachesYear = inst.subjects.some(
        (sub) => String(sub.sb_year) === filterYear
      );
      if (!teachesYear) return false;
    }
    if (filterSemester !== "All") {
      const teachesSem = inst.subjects.some(
        (sub) => String(sub.sb_semester) === filterSemester
      );
      if (!teachesSem) return false;
    }
    const query = searchQuery.toLowerCase();
    return (
      inst.in_fname.toLowerCase().includes(query) ||
      inst.in_lname.toLowerCase().includes(query) ||
      inst.in_dept.toLowerCase().includes(query) ||
      inst.subjects.some(
        (sub) =>
          sub.sb_name.toLowerCase().includes(query) ||
          sub.sb_miscode.toLowerCase().includes(query)
      )
    );
  });

  const handleOpenModal = (inst) => {
    navigate(`/mod-instructor-list/${inst.in_instructorID}`);
  };

  const handleCloseModal = () => {
    navigate("/mod-instructor-list");
  };

  const handleSubjectToggle = (subjectId) => {
    const isAlreadyExpanded = expandedSubjectId === subjectId;
    if (isAlreadyExpanded) {
      navigate(`/mod-instructor-list/${instructorID}`);
    } else {
      navigate(`/mod-instructor-list/${instructorID}/${subjectId}`);
    }
  };

  const subjectsToShow = selectedInstructor && expandedSubjectId
    ? selectedInstructor.subjects.filter(s => s.sb_subID === expandedSubjectId)
    : selectedInstructor?.subjects || [];


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ModeratorNavBar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Instructor List
        </h1>

        {/* Search and Filters Section... */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
          <input
            type="text"
            placeholder="Search by name, department, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/2 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Courses</option>
              <option value="BSIT">BSIT</option>
              <option value="BSIS">BSIS</option>
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Semesters</option>
              <option value="1">1st Semester</option>
              <option value="2">2nd Semester</option>
              <option value="3">Summer</option>
            </select>
          </div>
        </div>


        {/* Instructors Grid Section... */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((inst) => (
            <div
              key={inst.in_instructorID}
              className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
              onClick={() => handleOpenModal(inst)}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={inst.face || "/default-face.png"}
                  alt={`${inst.in_fname} ${inst.in_lname}`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                />
                <div>
                  <p className="font-semibold text-lg">
                    {inst.in_fname} {inst.in_mname ? inst.in_mname[0] + "." : ""}{" "}
                    {inst.in_lname} {inst.in_suffix}
                  </p>
                  <p className="text-gray-500 text-sm">{inst.in_dept}</p>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                {inst.subjects.slice(0, 3).map((sub, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {sub.sb_name} ({sub.sb_miscode}) - {sub.sb_course}
                  </div>
                ))}
                {inst.subjects.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{inst.subjects.length - 3} more subjects
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal / Popup */}
        {selectedInstructor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl p-2"
                onClick={handleCloseModal}
              >
                &times;
              </button>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={selectedInstructor.face || "/default-face.png"}
                  alt={`${selectedInstructor.in_fname} ${selectedInstructor.in_lname}`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                />
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedInstructor.in_fname}{" "}
                    {selectedInstructor.in_mname
                      ? selectedInstructor.in_mname[0] + "."
                      : ""}{" "}
                    {selectedInstructor.in_lname} {selectedInstructor.in_suffix}
                  </h2>
                  <p className="text-gray-600">{selectedInstructor.in_dept}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2 border-b pb-2">
                Subject Load
              </h3>

              {expandedSubjectId && (
                <button
                  onClick={() => navigate(`/mod-instructor-list/${instructorID}`)}
                  className="mb-3 text-sm font-semibold text-blue-600 hover:underline flex items-center"
                >
                  <span className="mr-1 text-lg">&larr;</span> Back to All Subjects
                </button>
              )}

              <div className="space-y-2">
                {subjectsToShow.map((sub) => {
                  const assignedClasses = classList.filter(
                    (c) =>
                      c.il_instructor_list.includes(
                        selectedInstructor.in_instructorID
                      ) && c.cl_year === sub.sb_year
                  );

                  const sectionsWithStudents = assignedClasses.map((cl) => {
                    const students = studentData
                      .filter(
                        (stud) =>
                          stud.st_course === sub.sb_course &&
                          stud.st_year === cl.cl_year &&
                          stud.st_section === cl.st_section
                      )
                      .sort((a, b) => a.st_lname.localeCompare(b.st_lname));

                    return { ...cl, students };
                  });

                  return (
                    <div key={sub.sb_subID} className="bg-gray-50 rounded-md border">
                      <button
                        className="w-full text-left p-3 hover:bg-gray-100 transition flex justify-between items-center"
                        onClick={() => handleSubjectToggle(sub.sb_subID)}
                        disabled={!!expandedSubjectId}
                      >
                        <div>
                          <p className="font-medium">
                            {sub.sb_name} ({sub.sb_miscode})
                          </p>
                          <p className="text-sm text-gray-600">
                            {sub.sb_course} - {sub.sb_units} units
                          </p>
                          <p className="text-sm text-gray-600">
                            {semesterMap[sub.sb_semester]} - Year {sub.sb_year}
                          </p>
                        </div>
                        {!expandedSubjectId && (
                          <span className="text-gray-400 text-2xl font-mono pr-2">&rsaquo;</span>
                        )}
                      </button>

                      {expandedSubjectId === sub.sb_subID && (
                        <div className="p-3 border-t border-gray-200 bg-white">
                          {sectionsWithStudents.length > 0 ? (
                            sectionsWithStudents.map((section) => (
                              <div key={section.cl_classID} className="mb-3">
                                <h4 className="font-semibold text-gray-800">
                                  Section: {sub.sb_course} {section.cl_year}-{section.st_section}
                                </h4>
                                {section.students.length > 0 ? (
                                  <ul className="list-disc pl-5 mt-1">
                                    {section.students.map((stud) => (
                                      <li key={stud.st_studID} className="text-xs text-gray-700">
                                        {stud.st_lname}, {stud.st_fname}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500 pl-5">
                                    No students listed for this section.
                                  </p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">
                              No sections assigned for this subject.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InstructorList;