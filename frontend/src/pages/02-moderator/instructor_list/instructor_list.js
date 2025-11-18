import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

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

  // Data State
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [instructorSubjects, setInstructorSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [sectionAssignments, setSectionAssignments] = useState([]);
  const [studentSections, setStudentSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const { instructorID, subjectID } = useParams();
  const navigate = useNavigate();

  // Process instructors with their subjects
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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [
          instructorsRes,
          subjectsRes,
          instructorSubjectsRes,
          sectionsRes,
          studentsRes,
          sectionAssignmentsRes,
          studentSectionsRes
        ] = await Promise.all([
          fetch("/instructors").then(res => res.json()),
          fetch("/subjects").then(res => res.json()),
          fetch("/instructor-subject").then(res => res.json()),
          fetch("/sections").then(res => res.json()),
          fetch("/students").then(res => res.json()),
          fetch("/section-assignments").then(res => res.json()),
          fetch("/student-sections").then(res => res.json())
        ]);

        setInstructors(instructorsRes.error ? [] : instructorsRes);
        setSubjects(subjectsRes.error ? [] : subjectsRes);
        setInstructorSubjects(instructorSubjectsRes.error ? [] : instructorSubjectsRes);
        setSections(sectionsRes.error ? [] : sectionsRes);
        setStudents(studentsRes.error ? [] : studentsRes);
        setSectionAssignments(sectionAssignmentsRes.error ? [] : sectionAssignmentsRes);
        setStudentSections(studentSectionsRes.error ? [] : studentSectionsRes);
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

  // Handle modal opening via URL
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

  // Filter Logic
  const filteredInstructors = useMemo(() => {
    return instructorsWithSubjects.filter((inst) => {
      const subjects = inst.subjects || [];

      if (filterCourse !== "All") {
        const teachesCourse = subjects.some((sub) => sub && sub.sb_course === filterCourse);
        if (!teachesCourse) return false;
      }
      if (filterYear !== "All") {
        const teachesYear = subjects.some((sub) => sub && String(sub.sb_year) === filterYear);
        if (!teachesYear) return false;
      }
      if (filterSemester !== "All") {
        const teachesSem = subjects.some((sub) => sub && String(sub.sb_semester) === filterSemester);
        if (!teachesSem) return false;
      }

      const query = searchQuery.toLowerCase();
      return (
        inst.in_fname.toLowerCase().includes(query) ||
        inst.in_lname.toLowerCase().includes(query) ||
        inst.in_dept.toLowerCase().includes(query) ||
        subjects.some((sub) => sub && (sub.sb_name.toLowerCase().includes(query) || sub.sb_miscode.toLowerCase().includes(query)))
      );
    });
  }, [instructorsWithSubjects, searchQuery, filterCourse, filterYear, filterSemester]);

  // Pagination Logic
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCourse, filterYear, filterSemester]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInstructors = filteredInstructors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Modal Data Logic
  const subjectsToShow = useMemo(() => {
    if (!selectedInstructor) return [];
    if (expandedSubjectId) {
      return (selectedInstructor.subjects || []).filter(s => s && String(s.sb_subid) === expandedSubjectId);
    }
    return selectedInstructor.subjects || [];
  }, [selectedInstructor, expandedSubjectId]);

  const getStudentsBySection = (sectionId) => {
    const studentSectionLinks = studentSections.filter(ss => ss.section_id === sectionId);
    return studentSectionLinks.map(ss => {
      const student = students.find(s => s.stud_id === ss.stud_id);
      return student ? { ...student, studentSectionId: ss.studSect_id } : null;
    }).filter(Boolean).sort((a, b) => a.stud_lname.localeCompare(b.stud_lname));
  };

  const getAssignedSections = (instructorId, subject) => {
    const instructorSubjectLink = instructorSubjects.find(is => is.ins_id === instructorId && is.sub_id === subject.sb_subid);
    if (!instructorSubjectLink) return [];
    const assignments = sectionAssignments.filter(assignment => assignment.insub_id === instructorSubjectLink.insub_id);
    return assignments.map(assignment => {
      const section = sections.find(s => s.section_id === assignment.section_id);
      return section ? { ...section, assignmentId: assignment.ssi_id } : null;
    }).filter(Boolean);
  };

  const handleOpenModal = (inst) => {
    navigate(`/mod-instructor-list/${inst.in_instructorid}`);
  };

  const handleCloseModal = () => navigate("/mod-instructor-list");

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <ModeratorNavBar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex items-center justify-center text-red-600">
          {error}
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
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500">
              <option value="All">All Courses</option>
              <option value="BSIT">BSIT</option>
              <option value="BSIS">BSIS</option>
              <option value="BSCS">BSCS</option>
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

        {/* Pagination Controls (MOVED TO TOP) */}
        {filteredInstructors.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-6 border border-gray-200 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredInstructors.length)}</span> of <span className="font-medium">{filteredInstructors.length}</span> instructors
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

        {/* Instructors Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px] content-start">
          {currentInstructors.map((inst) => {
            const subjects = inst.subjects || [];

            return (
              <div
                key={inst.in_instructorid}
                className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition h-full"
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

        {/* Modal / Popup Logic (Unchanged) */}
        {selectedInstructor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
              <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl p-2" onClick={handleCloseModal}>&times;</button>
              <div className="flex items-center space-x-4 mb-6">
                <img src={selectedInstructor.face} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-300" onError={(e) => { e.target.src = "/profiles/profile-default.png"; }} />
                <div>
                  <h2 className="text-2xl font-bold">{selectedInstructor.in_fname} {selectedInstructor.in_lname}</h2>
                  <p className="text-gray-600">{selectedInstructor.in_dept}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2 border-b pb-2">Subject Load</h3>
              {expandedSubjectId && <button onClick={() => navigate(`/mod-instructor-list/${instructorID}`)} className="mb-3 text-sm font-semibold text-blue-600 hover:underline">&larr; Back to All Subjects</button>}

              <div className="space-y-2">
                {subjectsToShow.map((sub) => {
                  if (!sub) return null;
                  const assignedSections = getAssignedSections(selectedInstructor.in_instructorid, sub);
                  const sectionsWithStudents = assignedSections.map((section) => ({ ...section, students: getStudentsBySection(section.section_id) }));

                  return (
                    <div key={sub.sb_subid} className="bg-gray-50 rounded-md border">
                      <button className="w-full text-left p-3 hover:bg-gray-100 transition flex justify-between items-center" onClick={() => handleSubjectToggle(String(sub.sb_subid))} disabled={!!expandedSubjectId}>
                        <div>
                          <p className="font-medium">{sub.sb_name} ({sub.sb_miscode})</p>
                          <p className="text-sm text-gray-600">{sub.sb_course} - {sub.sb_units} units</p>
                        </div>
                        {!expandedSubjectId && <span className="text-gray-400 text-2xl font-mono pr-2">&rsaquo;</span>}
                      </button>

                      {expandedSubjectId === String(sub.sb_subid) && (
                        <div className="p-3 border-t border-gray-200 bg-white">
                           {sectionsWithStudents.length > 0 ? sectionsWithStudents.map((section) => (
                             <div key={section.section_id} className="mb-4 p-3 border rounded-lg bg-gray-50">
                               <h4 className="font-semibold text-gray-800">{section.sect_name}</h4>
                               {section.students.length > 0 ? (
                                 <ul className="list-disc pl-5 space-y-1 mt-2">
                                   {section.students.map(stud => <li key={stud.stud_id} className="text-sm">{stud.stud_lname}, {stud.stud_fname}</li>)}
                                 </ul>
                               ) : <p className="text-sm text-gray-500">No students.</p>}
                             </div>
                           )) : <p className="text-sm text-gray-500">No sections assigned.</p>}
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