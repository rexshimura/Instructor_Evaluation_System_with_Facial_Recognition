import React, { useState } from "react";
import StudentNavBar from "../../components/module_layout/StudentNavBar";
import instructors from "../../data/instructors";
import subjectLoadData from "../../data/subjectload";

const semesterMap = {
  1: "1st Semester",
  2: "2nd Semester",
  3: "Summer",
};

export default function StudentInstructorListPage() {
  const [selectedInstructor, setSelectedInstructor] = useState(null);

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

  // Filter instructors whose subjects match student's course, year, semester
  const alignedInstructors = instructors
    .map((inst) => {
      const subjects = subjectLoadData.filter(
        (sub) =>
          sub.instructorID === inst.instructorID &&
          sub.course === student.course &&
          sub.year === student.year &&
          sub.semester === student.semester // Compare numbers directly
      );
      return { ...inst, subjects };
    })
    .filter((inst) => inst.subjects.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <StudentNavBar />

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Instructors for {student.firstName} {student.lastName} -{" "}
          {semesterMap[student.semester]}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alignedInstructors.map((inst) => (
            <div
              key={inst.instructorID}
              className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
              onClick={() => setSelectedInstructor(inst)}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={inst.face || "/default-face.png"}
                  alt={`${inst.fname} ${inst.lname}`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                />
                <div>
                  <p className="font-semibold text-lg">
                    {inst.fname} {inst.mname[0] ? inst.mname[0] + "." : ""}{" "}
                    {inst.lname} {inst.suffix}
                  </p>
                  <p className="text-gray-500 text-sm">{inst.department}</p>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                {inst.subjects.map((sub, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {sub.subjectName} ({sub.miscode}) - {sub.course}
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
                alt={`${selectedInstructor.fname} ${selectedInstructor.lname}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
              />
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedInstructor.fname}{" "}
                  {selectedInstructor.mname[0] ? selectedInstructor.mname[0] + "." : ""}{" "}
                  {selectedInstructor.lname} {selectedInstructor.suffix}
                </h2>
                <p className="text-gray-600">{selectedInstructor.department}</p>
                <p className="text-gray-600">{selectedInstructor.email}</p>
                <p className="text-gray-600">{selectedInstructor.contactNumber}</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-2 border-b pb-2">Subject Load</h3>
            <div className="space-y-2">
              {selectedInstructor.subjects.map((sub, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded-md border">
                  <p className="font-medium">
                    {sub.subjectName} ({sub.miscode})
                  </p>
                  <p className="text-sm text-gray-600">
                    {sub.course} - {sub.units} units
                  </p>
                  <p className="text-sm text-gray-600">
                    {semesterMap[sub.semester]} - Year {sub.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
