import React, { useState } from "react";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar"; // Import the same navbar
import instructors from "../../../data/instructors";
import subjectLoad from "../../../data/subjectload";

const InstructorList = () => {
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  // Combine instructor info with their subjects
  const instructorsWithSubjects = instructors.map((inst) => {
    const subjects = subjectLoad.filter(
      (sub) => sub.instructorID === inst.instructorID
    );
    return { ...inst, subjects };
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <ModeratorNavBar />

      {/* Page Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Instructor List
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructorsWithSubjects.map((inst) => (
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
                    {inst.fname} {inst.mname ? inst.mname[0] + "." : ""}{" "}
                    {inst.lname} {inst.suffix}
                  </p>
                  <p className="text-gray-500 text-sm">{inst.department}</p>
                </div>
              </div>

              {/* Subject List Preview */}
              <div className="mt-4 space-y-1">
                {inst.subjects.slice(0, 3).map((sub, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {sub.subjectName} ({sub.miscode}) - {sub.course}
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
                  alt={`${selectedInstructor.fname} ${selectedInstructor.lname}`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                />
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedInstructor.fname}{" "}
                    {selectedInstructor.mname
                      ? selectedInstructor.mname[0] + "."
                      : ""}{" "}
                    {selectedInstructor.lname} {selectedInstructor.suffix}
                  </h2>
                  <p className="text-gray-600">{selectedInstructor.department}</p>
                  <p className="text-gray-600">{selectedInstructor.email}</p>
                  <p className="text-gray-600">{selectedInstructor.contactNumber}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2 border-b pb-2">
                Subject Load
              </h3>
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
                      Semester {sub.semester} - Year {sub.year}
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
