import React, { useState, useEffect } from "react";
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
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const navigate = useNavigate();

  const userString = sessionStorage.getItem("user");
  const student = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (student) {
      const fetchData = async () => {
        try {
          const [instrRes, subRes, secRes, evalRes] = await Promise.all([
            axios.get("/instructor_list"),
            axios.get("/subject_list"),
            axios.get("/section_list"),
            axios.get(`/evaluations/${student.st_studid}`),
          ]);

          setInstructors(instrRes.data);
          setSubjects(subRes.data);
          setSections(secRes.data);
          setEvaluations(evalRes.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [student]);

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

  const isSubjectEvaluated = (instructorId, subjectId) => {
    return evaluations.some(
      (ev) =>
        ev.in_instructorid === instructorId &&
        ev.ev_subject === subjectId &&
        ev.ev_semester === student.st_semester
    );
  };

  // --- Data filtering ---
  const studentSection = sections.find(
    (sec) =>
      sec.section_year === student.st_year &&
      sec.section_name === student.st_section
  );
  const instructorIDsForStudent = studentSection
    ? studentSection.section_ins_list
    : [];
  const instructorsForClass = instructors.filter((inst) =>
    instructorIDsForStudent.includes(inst.in_instructorid)
  );

  const alignedInstructors = instructorsForClass
    .map((inst) => {
      const subjs = subjects.filter(
        (sub) =>
          inst.in_subhandled.includes(sub.sb_subid.toString()) &&
          sub.sb_course === student.st_course &&
          sub.sb_year === student.st_year &&
          sub.sb_semester === student.st_semester
      );

      const mappedSubjects = subjs.map((sub) => ({
        ...sub,
        isEvaluated: isSubjectEvaluated(inst.in_instructorid, sub.sb_subid),
      }));

      const isAnySubjectPending = mappedSubjects.some((sub) => !sub.isEvaluated);

      return {
        ...inst,
        subjects: mappedSubjects,
        isAnySubjectPending,
      };
    })
    .filter((inst) => inst.subjects.length > 0);

  const filteredInstructors = alignedInstructors.filter((inst) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${inst.in_fname} ${inst.in_lname}`.toLowerCase();

    const subjectMatch = inst.subjects.some(
      (sub) =>
        sub.sb_name.toLowerCase().includes(searchLower) ||
        sub.sb_miscode.toLowerCase().includes(searchLower)
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

  const handleEvaluateClick = (in_instructorID, sb_subID) => {
    navigate(`/instructor-evaluation/${in_instructorID}/${sb_subID}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <StudentNavBar />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Instructors for {student.st_fname} {student.st_lname} -{" "}
          {semesterMap[student.st_semester]}
        </h1>

        {/* 🔹 Status filter buttons */}
        <div className="flex justify-center gap-3 mb-6">
          {["all", "pending", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold ${statusFilter === status
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* 🔹 Search box */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search by name, subject, or code..."
            className="w-full max-w-md p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredInstructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstructors.map((inst) => (
              <div
                key={inst.in_instructorid}
                className="relative bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
                onClick={() => setSelectedInstructor(inst)}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={inst.face || "/profiles/profile-default.png"}
                    alt={`${inst.in_fname} ${inst.in_lname}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                  />
                  <div>
                    <p className="font-semibold text-lg">
                      {inst.in_fname}{" "}
                      {inst.in_mname ? inst.in_mname[0] + "." : ""}{" "}
                      {inst.in_lname} {inst.in_suffix}
                    </p>
                    <p className="text-gray-500 text-sm">{inst.in_dept}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {inst.subjects.map((sub, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-600 flex justify-between items-center bg-gray-50 p-2 rounded"
                    >
                      <div>
                        {sub.sb_name} ({sub.sb_miscode}) - {sub.sb_course}
                      </div>
                      {sub.isEvaluated ? (
                        <span className="bg-green-500 text-white font-bold py-1 px-2 rounded">
                          Completed
                        </span>
                      ) : (
                        <button
                          className="bg-blue-500 text-white font-bold py-1 px-2 rounded hover:bg-blue-600 transition"
                          onClick={(e) => {
                            e.stopPropagation(); // ✅ prevent modal open
                            handleEvaluateClick(inst.in_instructorid, sub.sb_subid);
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
          <p className="text-center text-gray-500 mt-8">
            No instructors found matching your filters.
          </p>
        )}
      </main>

      {/* --- Modal logic integrated --- */}
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
                src={
                  selectedInstructor.face || "/profiles/profile-default.png"
                }
                alt={`${selectedInstructor.in_fname} ${selectedInstructor.in_lname}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedInstructor.in_fname}{" "}
                  {selectedInstructor.in_mname
                    ? selectedInstructor.in_mname[0] + "."
                    : ""}{" "}
                  {selectedInstructor.in_lname}{" "}
                  {selectedInstructor.in_suffix}
                </h2>
                <p className="text-gray-600">{selectedInstructor.in_dept}</p>
                <p className="text-gray-600">{selectedInstructor.in_email}</p>
                <p className="text-gray-600">{selectedInstructor.in_cnum}</p>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 border-b pb-2">
              Subject Load
            </h3>
            <div className="space-y-4">
              {selectedInstructor.subjects.map((sub, index) => {
                const isEvaluated = isSubjectEvaluated(
                  selectedInstructor.in_instructorid,
                  sub.sb_subid
                );
                return (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded-md border flex justify-between items-center"
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
                    <button
                      disabled={isEvaluated}
                      className={
                        isEvaluated
                          ? "bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
                          : "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition"
                      }
                      onClick={() =>
                        !isEvaluated &&
                        handleEvaluateClick(
                          selectedInstructor.in_instructorid,
                          sub.sb_subid
                        )
                      }
                    >
                      {isEvaluated ? "Evaluated" : "Evaluate"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
