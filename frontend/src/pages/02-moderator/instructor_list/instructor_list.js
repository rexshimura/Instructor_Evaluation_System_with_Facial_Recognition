import React, { useState } from "react";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import instructors from "../../../data/list-instructors";
import subjectLoad from "../../../data/list-subjects";

const semesterMap = {
  1: "1st Semester",
  2: "2nd Semester",
  3: "Summer",
};

const InstructorList = () => {
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterSemester, setFilterSemester] = useState("All");

  // Combine instructor info with their subjects
  const instructorsWithSubjects = instructors.map((inst) => {
    const subjects = subjectLoad.filter((sub) =>
      inst.in_subhandled.includes(sub.sb_subID)
    );
    return { ...inst, subjects };
  });

  // ✅ Apply filter + search
  const filteredInstructors = instructorsWithSubjects.filter((inst) => {
    // Course filter
    if (filterCourse !== "All") {
      const teachesCourse = inst.subjects.some(
        (sub) => sub.sb_course === filterCourse
      );
      if (!teachesCourse) return false;
    }

    // Year filter
    if (filterYear !== "All") {
      const teachesYear = inst.subjects.some(
        (sub) => String(sub.sb_year) === filterYear
      );
      if (!teachesYear) return false;
    }

    // Semester filter
    if (filterSemester !== "All") {
      const teachesSem = inst.subjects.some(
        (sub) => String(sub.sb_semester) === filterSemester
      );
      if (!teachesSem) return false;
    }

    // Search (name, dept, subject)
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      inst.in_fname.toLowerCase().includes(query) ||
      inst.in_lname.toLowerCase().includes(query) ||
      inst.in_dept.toLowerCase().includes(query) ||
      inst.subjects.some(
        (sub) =>
          sub.sb_name.toLowerCase().includes(query) ||
          sub.sb_miscode.toLowerCase().includes(query)
      );

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <ModeratorNavBar />

      {/* Page Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Instructor List
        </h1>

        {/* ✅ Search + Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, department, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-1/2 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          />

          {/* Filters */}
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

        {/* Instructors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((inst) => (
            <div
              key={inst.in_instructorID}
              className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
              onClick={() => setSelectedInstructor(inst)}
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

              {/* Subject List Preview */}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-bold text-xl"
                onClick={() => setSelectedInstructor(null)}
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
                  <p className="text-gray-600">{selectedInstructor.in_email}</p>
                  <p className="text-gray-600">{selectedInstructor.in_cnum}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2 border-b pb-2">
                Subject Load
              </h3>
              <div className="space-y-2">
                {selectedInstructor.subjects.map((sub, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded-md border">
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
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InstructorList;
