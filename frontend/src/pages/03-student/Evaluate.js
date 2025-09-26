import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavBar from "../../components/module_layout/StudentNavBar";
import instructorData from "../../data/list-instructors";
import subjectLoad from "../../data/list-subjects";
import classList from "../../data/list-class";

const semesterMap = {
  1: "1st Semester",
  2: "2nd Semester",
  3: "Summer",
};

export default function StudentInstructorListPage() {
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const navigate = useNavigate();

  // Get logged-in student from sessionStorage
  const userString = sessionStorage.getItem("user");
  const student = userString ? JSON.parse(userString) : null;

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col">
        <StudentNavBar />
        <main className="flex-1 flex items-center justify-center text-red-500 text-lg">
          Please log in to view instructors.
        </main>
        <footer className="bg-gray-200 text-center py-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)
          </p>
        </footer>
      </div>
    );
  }

  // Find the class that matches the student's year and section
  const studentClass = classList.find(
    (c) =>
      c.cl_year === student.st_year &&
      c.st_section === student.st_section
  );

  // Get the list of instructor IDs for the student's class
  const instructorIDsForStudent = studentClass ? studentClass.il_instructor_list : [];

  // Filter the list of all instructors to only include those assigned to the student's class
  const instructorsForClass = instructorData.filter(inst =>
    instructorIDsForStudent.includes(inst.in_instructorID)
  );

  // For each of these instructors, find the subjects they teach that match the student's details
  const alignedInstructors = instructorsForClass
    .map((inst) => {
      const subjects = subjectLoad.filter(
        (sub) =>
          inst.in_subhandled.includes(sub.sb_subID) &&
          sub.sb_course === student.st_course &&
          sub.sb_year === student.st_year &&
          sub.sb_semester === student.st_semester
      );
      return { ...inst, subjects };
    })
    .filter((inst) => inst.subjects.length > 0);

  const handleEvaluateClick = (in_instructorID, sb_subID) => {
    navigate(`/instructor-evaluation/${in_instructorID}/${sb_subID}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <StudentNavBar />

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Instructors for {student.st_fname} {student.st_lname} -{" "}
          {semesterMap[student.st_semester]}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alignedInstructors.map((inst) => (
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

              <div className="mt-4 space-y-1">
                {inst.subjects.map((sub, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {sub.sb_name} ({sub.sb_miscode}) - {sub.sb_course}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)
        </p>
      </footer>

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
                  {selectedInstructor.in_mname ? selectedInstructor.in_mname[0] + "." : ""}{" "}
                  {selectedInstructor.in_lname} {selectedInstructor.in_suffix}
                </h2>
                <p className="text-gray-600">{selectedInstructor.in_dept}</p>
                <p className="text-gray-600">{selectedInstructor.in_email}</p>
                <p className="text-gray-600">{selectedInstructor.in_cnum}</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-2 border-b pb-2">Subject Load</h3>
            <div className="space-y-4">
              {selectedInstructor.subjects.map((sub, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md border flex justify-between items-center">
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
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition"
                    onClick={() => handleEvaluateClick(selectedInstructor.in_instructorID, sub.sb_subID)}
                  >
                    Evaluate
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
