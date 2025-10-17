import React, { useState, useEffect, useMemo } from "react";
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
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [instructorSubjects, setInstructorSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [sectionAssignments, setSectionAssignments] = useState([]); // NEW: For section-subject-instructor relationships
  const [studentSections, setStudentSections] = useState([]); // NEW: For student-section relationships
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { instructorID, subjectID } = useParams();
  const navigate = useNavigate();

  // Process instructors with their subjects using useMemo
  const instructorsWithSubjects = useMemo(() => {
    return instructors.map(instructor => {
      const instructorSubjectLinks = instructorSubjects.filter(
        link => link.ins_id === instructor.ins_id
      );
      
      const instructorSubjectsList = instructorSubjectLinks.map(link => {
        const subject = subjects.find(sub => sub.sub_id === link.sub_id);
        return subject ? {
          sb_subid: subject.sub_id,
          sb_name: subject.sub_name,
          sb_miscode: subject.sub_miscode,
          sb_course: subject.sub_course,
          sb_year: subject.sub_year,
          sb_semester: subject.sub_semester,
          sb_units: subject.sub_units
        } : null;
      }).filter(Boolean);

      return {
        in_instructorid: instructor.ins_id,
        in_fname: instructor.ins_fname,
        in_mname: instructor.ins_mname,
        in_lname: instructor.ins_lname,
        in_suffix: instructor.ins_suffix,
        in_dept: instructor.ins_dept,
        face: instructor.ins_profile_pic || "/profiles/profile-default.png",
        subjects: instructorSubjectsList
      };
    });
  }, [instructors, subjects, instructorSubjects]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data
        const [
          instructorsRes, 
          subjectsRes, 
          instructorSubjectsRes, 
          sectionsRes, 
          studentsRes,
          sectionAssignmentsRes, // NEW: Fetch section assignments
          studentSectionsRes     // NEW: Fetch student-section relationships
        ] = await Promise.all([
          fetch("/instructors").then(res => res.json()),
          fetch("/subjects").then(res => res.json()),
          fetch("/instructor-subject").then(res => res.json()),
          fetch("/sections").then(res => res.json()),
          fetch("/students").then(res => res.json()),
          fetch("/section-assignments").then(res => res.json()), // NEW
          fetch("/student-sections").then(res => res.json())    // NEW
        ]);

        // Handle errors
        const responses = [
          { data: instructorsRes, name: "instructors" },
          { data: subjectsRes, name: "subjects" },
          { data: instructorSubjectsRes, name: "instructor-subject" },
          { data: sectionsRes, name: "sections" },
          { data: studentsRes, name: "students" },
          { data: sectionAssignmentsRes, name: "section-assignments" },
          { data: studentSectionsRes, name: "student-sections" }
        ];

        for (const response of responses) {
          if (response.data.error) {
            throw new Error(`Failed to load ${response.name}: ${response.data.error}`);
          }
        }

        setInstructors(instructorsRes);
        setSubjects(subjectsRes);
        setInstructorSubjects(instructorSubjectsRes);
        setSections(sectionsRes);
        setStudents(studentsRes);
        setSectionAssignments(sectionAssignmentsRes); // NEW
        setStudentSections(studentSectionsRes);       // NEW
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

  // Handle instructor selection and subject expansion
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

  // Filter instructors based on search and filters
  const filteredInstructors = useMemo(() => {
    return instructorsWithSubjects.filter((inst) => {
      const subjects = inst.subjects || [];
      
      // Apply filters
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
      
      // Apply search
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
  }, [instructorsWithSubjects, searchQuery, filterCourse, filterYear, filterSemester]);

  // Get subjects to show in modal
  const subjectsToShow = useMemo(() => {
    if (!selectedInstructor) return [];
    if (expandedSubjectId) {
      return (selectedInstructor.subjects || []).filter(s => s && String(s.sb_subid) === expandedSubjectId);
    }
    return selectedInstructor.subjects || [];
  }, [selectedInstructor, expandedSubjectId]);

  // NEW: Get students by section using student-sections relationships
  const getStudentsBySection = (sectionId) => {
    const studentSectionLinks = studentSections.filter(
      ss => ss.section_id === sectionId
    );
    
    return studentSectionLinks.map(ss => {
      const student = students.find(s => s.stud_id === ss.stud_id);
      return student ? {
        ...student,
        studentSectionId: ss.studSect_id
      } : null;
    }).filter(Boolean).sort((a, b) => a.stud_lname.localeCompare(b.stud_lname));
  };

  // NEW: Find sections for instructor and subject using section-assignments
  const getAssignedSections = (instructorId, subject) => {
    // Get instructor-subject link ID
    const instructorSubjectLink = instructorSubjects.find(
      is => is.ins_id === instructorId && is.sub_id === subject.sb_subid
    );

    if (!instructorSubjectLink) return [];

    // Find section assignments for this instructor-subject combination
    const assignments = sectionAssignments.filter(
      assignment => assignment.insub_id === instructorSubjectLink.insub_id
    );

    // Get the actual section objects
    return assignments.map(assignment => {
      const section = sections.find(s => s.section_id === assignment.section_id);
      return section ? {
        ...section,
        assignmentId: assignment.ssi_id
      } : null;
    }).filter(Boolean);
  };

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
              <option value="BSCS">BSCS</option>
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
            const subjects = inst.subjects || [];
            
            return (
              <div
                key={inst.in_instructorid}
                className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
                onClick={() => handleOpenModal(inst)}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={inst.face}
                    alt={`${inst.in_fname} ${inst.in_lname}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                    onError={(e) => {
                      e.target.src = "/profiles/profile-default.png";
                    }}
                  />
                  <div>
                    <p className="font-semibold text-lg">
                      {inst.in_fname} {inst.in_mname ? inst.in_mname[0] + "." : ""}{" "}
                      {inst.in_lname} {inst.in_suffix}
                    </p>
                    <p className="text-gray-500 text-sm">{inst.in_dept}</p>
                    <p className="text-xs text-gray-400">ID: {inst.in_instructorid}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  {subjects.slice(0, 3).map((sub, index) => (
                    <div key={`${inst.in_instructorid}-${sub.sb_subid}-${index}`} className="text-sm text-gray-600">
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
                  src={selectedInstructor.face}
                  alt={`${selectedInstructor.in_fname} ${selectedInstructor.in_lname}`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                  onError={(e) => {
                    e.target.src = "/profiles/profile-default.png";
                  }}
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
                  <p className="text-sm text-gray-500">ID: {selectedInstructor.in_instructorid}</p>
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
                  
                  const assignedSections = getAssignedSections(selectedInstructor.in_instructorid, sub);

                  const sectionsWithStudents = assignedSections.map((section) => {
                    const studentsInSection = getStudentsBySection(section.section_id);
                    return { ...section, students: studentsInSection };
                  });

                  return (
                    <div key={sub.sb_subid} className="bg-gray-50 rounded-md border">
                      <button
                        className="w-full text-left p-3 hover:bg-gray-100 transition flex justify-between items-center"
                        onClick={() => handleSubjectToggle(String(sub.sb_subid))}
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
                            Sections: {assignedSections.length} | 
                            Students: {sectionsWithStudents.reduce((total, section) => total + section.students.length, 0)}
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
                                    Section: {section.sect_course} {section.sect_year_level}-{section.sect_name}
                                  </h4>
                                  <p className="text-xs text-gray-500 mb-2">
                                    School Year: {section.sect_school_year}
                                  </p>
                                  {section.students.length > 0 ? (
                                    <div>
                                      <p className="text-sm text-gray-600 mb-2">
                                        Students ({section.students.length}):
                                      </p>
                                      <ul className="list-disc pl-5 space-y-1">
                                        {section.students.map((stud) => (
                                          <li key={stud.stud_id} className="text-sm text-gray-700">
                                            {stud.stud_lname}, {stud.stud_fname} ({stud.stud_id})
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
                                This instructor is not assigned to any sections for this subject.
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