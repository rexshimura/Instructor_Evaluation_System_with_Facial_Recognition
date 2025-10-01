import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";

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
  const [instructorsWithSubjects, setInstructorsWithSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { instructorID, subjectID } = useParams();
  const navigate = useNavigate();

  // Helper function to ensure subjects is always an array
  const ensureSubjectsArray = (subjects) => {
    if (!subjects) return [];
    if (Array.isArray(subjects)) return subjects;
    if (typeof subjects === 'string') {
      try {
        return JSON.parse(subjects);
      } catch (e) {
        console.warn('Failed to parse subjects string:', subjects);
        return [];
      }
    }
    return [];
  };

  // Helper function to check if array contains a value (handles string/number conversion)
  const arrayContains = (arr, value) => {
    if (!arr || !Array.isArray(arr)) return false;
    return arr.some(item => String(item) === String(value));
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [instructorsRes, subjectsRes, sectionsRes, studentsRes] = await Promise.all([
          fetch("http://localhost:5000/instructor_list").then(res => res.json()),
          fetch("http://localhost:5000/subject_list").then(res => res.json()),
          fetch("http://localhost:5000/section_list").then(res => res.json()),
          fetch("http://localhost:5000/student_list").then(res => res.json())
        ]);

        if (instructorsRes.error) throw new Error(instructorsRes.error);
        if (subjectsRes.error) throw new Error(subjectsRes.error);
        if (sectionsRes.error) throw new Error(sectionsRes.error);
        if (studentsRes.error) throw new Error(studentsRes.error);

        // Process instructors with their subjects
        const processedInstructors = instructorsRes.map(instructor => {
          const instructorSubjects = subjectsRes.filter(subject => 
            instructor.in_subhandled && 
            arrayContains(instructor.in_subhandled, subject.sb_subid)
          );

          return {
            ...instructor,
            subjects: instructorSubjects
          };
        });

        setInstructorsWithSubjects(processedInstructors);
        setSections(sectionsRes);
        setStudents(studentsRes);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (instructorID && instructorsWithSubjects.length > 0) {
      const inst = instructorsWithSubjects.find(
        (i) => String(i.in_instructorid) === instructorID
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
    const subjects = ensureSubjectsArray(inst.subjects);
    
    if (filterCourse !== "All") {
      const teachesCourse = subjects.some(
        (sub) => sub && sub.sb_course === filterCourse
      );
      if (!teachesCourse) return false;
    }
    if (filterYear !== "All") {
      const teachesYear = subjects.some(
        (sub) => sub && String(sub.sb_year) === filterYear
      );
      if (!teachesYear) return false;
    }
    if (filterSemester !== "All") {
      const teachesSem = subjects.some(
        (sub) => sub && String(sub.sb_semester) === filterSemester
      );
      if (!teachesSem) return false;
    }
    const query = searchQuery.toLowerCase();
    return (
      inst.in_fname.toLowerCase().includes(query) ||
      inst.in_lname.toLowerCase().includes(query) ||
      inst.in_dept.toLowerCase().includes(query) ||
      subjects.some(
        (sub) =>
          sub &&
          (sub.sb_name.toLowerCase().includes(query) ||
          sub.sb_miscode.toLowerCase().includes(query))
      )
    );
  });

  const handleOpenModal = (inst) => {
    navigate(`/mod-instructor-list/${inst.in_instructorid}`);
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
    ? ensureSubjectsArray(selectedInstructor.subjects).filter(s => s && String(s.sb_subid) === expandedSubjectId)
    : ensureSubjectsArray(selectedInstructor?.subjects) || [];

  // Get students by section
  const getStudentsBySection = (course, year, section) => {
    return students.filter(
      (stud) =>
        stud.st_course === course &&
        stud.st_year === year &&
        stud.st_section === section
    ).sort((a, b) => a.st_lname.localeCompare(b.st_lname));
  };

  // Debug function to check section data
  const debugSections = (instructorId, subject) => {
    console.log("=== DEBUG SECTIONS ===");
    console.log("Instructor ID:", instructorId);
    console.log("Subject:", subject);
    console.log("All sections:", sections);
    
    const relevantSections = sections.filter(section => {
      const hasInstructor = arrayContains(section.section_ins_list, instructorId);
      const sameYear = section.section_year === subject.sb_year;
      console.log(`Section ${section.section_id}:`, {
        section_ins_list: section.section_ins_list,
        hasInstructor,
        section_year: section.section_year,
        subject_year: subject.sb_year,
        sameYear
      });
      return hasInstructor && sameYear;
    });
    
    console.log("Relevant sections:", relevantSections);
    return relevantSections;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <ModeratorNavBar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading instructors...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <ModeratorNavBar />
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
      <ModeratorNavBar />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Instructor List
        </h1>

        {/* Search and Filters Section */}
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

        {/* Instructors Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((inst) => {
            const subjects = ensureSubjectsArray(inst.subjects);
            
            return (
              <div
                key={inst.in_instructorid}
                className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
                onClick={() => handleOpenModal(inst)}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={inst.face || "/profiles/profile-default.png"}
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
                  {subjects.slice(0, 3).map((sub, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {sub.sb_name} ({sub.sb_miscode}) - {sub.sb_course}
                    </div>
                  ))}
                  {subjects.length > 3 && (
                    <p className="text-xs text-gray-400">
                      +{subjects.length - 3} more subjects
                    </p>
                  )}
                  {subjects.length === 0 && (
                    <p className="text-xs text-gray-400">No subjects assigned</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredInstructors.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No instructors found matching your criteria.
          </div>
        )}

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
                  src={selectedInstructor.face || "/profiles/profile-default.png"}
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
                  if (!sub) return null;
                  
                  // Find sections where this instructor teaches this subject
                  const assignedSections = sections.filter(section => {
                    const hasInstructor = arrayContains(section.section_ins_list, selectedInstructor.in_instructorid);
                    const sameYear = section.section_year === sub.sb_year;
                    
                    // For debugging - uncomment the next line to see section matching in console
                    // console.log(`Section ${section.section_id}: instructor ${selectedInstructor.in_instructorid} in ${section.section_ins_list}? ${hasInstructor}, year match? ${sameYear}`);
                    
                    return hasInstructor && sameYear;
                  });

                  const sectionsWithStudents = assignedSections.map((section) => {
                    const studentsInSection = getStudentsBySection(
                      sub.sb_course,
                      section.section_year,
                      section.section_name
                    );

                    return { ...section, students: studentsInSection };
                  });

                  return (
                    <div key={sub.sb_subid} className="bg-gray-50 rounded-md border">
                      <button
                        className="w-full text-left p-3 hover:bg-gray-100 transition flex justify-between items-center"
                        onClick={() => {
                          // Debug: check why sections might not be showing
                          debugSections(selectedInstructor.in_instructorid, sub);
                          handleSubjectToggle(String(sub.sb_subid));
                        }}
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
                          <p className="text-xs text-gray-500 mt-1">
                            Sections: {assignedSections.length}
                          </p>
                        </div>
                        {!expandedSubjectId && (
                          <span className="text-gray-400 text-2xl font-mono pr-2">&rsaquo;</span>
                        )}
                      </button>

                      {expandedSubjectId === String(sub.sb_subid) && (
                        <div className="p-3 border-t border-gray-200 bg-white">
                          {sectionsWithStudents.length > 0 ? (
                            <>
                              <p className="text-sm text-gray-600 mb-3">
                                Showing sections for {sub.sb_course} Year {sub.sb_year}:
                              </p>
                              {sectionsWithStudents.map((section) => (
                                <div key={section.section_id} className="mb-4 p-3 border rounded-lg bg-gray-50">
                                  <h4 className="font-semibold text-gray-800 mb-2">
                                    Section: {sub.sb_course} {section.section_year}-{section.section_name}
                                  </h4>
                                  {section.students.length > 0 ? (
                                    <div>
                                      <p className="text-sm text-gray-600 mb-2">
                                        Students ({section.students.length}):
                                      </p>
                                      <ul className="list-disc pl-5 space-y-1">
                                        {section.students.map((stud) => (
                                          <li key={stud.st_studid} className="text-sm text-gray-700">
                                            {stud.st_lname}, {stud.st_fname} ({stud.st_studid})
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">
                                      No students enrolled in this section.
                                    </p>
                                  )}
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-500 mb-2">
                                No sections assigned for this subject.
                              </p>
                              <p className="text-xs text-gray-400">
                                Check that the instructor is in the section_ins_list and the section year matches the subject year.
                              </p>
                            </div>
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