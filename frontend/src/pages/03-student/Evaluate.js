import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavBar from "../../components/module_layout/StudentNavBar";
import instructorData from "../../data/list-instructors";
import subjectLoad from "../../data/list-subjects";
import classList from "../../data/list-class";
import evaluations from "../../data/list-evaluations";

const semesterMap = {
  1: "1st Semester",
  2: "2nd Semester",
  3: "Summer",
};

export default function StudentInstructorListPage() {
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const userString = sessionStorage.getItem("user");
  const student = userString ? JSON.parse(userString) : null;

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

  // --- Data filtering logic to get the initial list remains the same ---
  const studentClass = classList.find(
    (c) =>
      c.cl_year === student.st_year && c.st_section === student.st_section
  );
  const instructorIDsForStudent = studentClass ? studentClass.il_instructor_list : [];
  const instructorsForClass = instructorData.filter((inst) =>
    instructorIDsForStudent.includes(inst.in_instructorID)
  );

  // Helper function to check if a subject has been evaluated by the student
  const isSubjectEvaluated = (instructorID, subjectID) => {
    return evaluations.some(ev =>
      ev.st_studID === student.st_studID &&
      ev.in_instID === instructorID &&
      ev.sb_subID === subjectID
    );
  };

  // Update: Include evaluation status logic here (only for filtering, not the card tag)
  const alignedInstructors = instructorsForClass
    .map((inst) => {
      const subjects = subjectLoad.filter(
        (sub) =>
          inst.in_subhandled.includes(sub.sb_subID) &&
          sub.sb_course === student.st_course &&
          sub.sb_year === student.st_year &&
          sub.sb_semester === student.st_semester
      );

      // Note: isAnySubjectPending is now only used for determining if the card
      // overall has an action pending (though the card itself won't display it)
      let isAnySubjectPending = false;
      if (subjects.length > 0) {
        isAnySubjectPending = subjects.some(
          (sub) => !isSubjectEvaluated(inst.in_instructorID, sub.sb_subID)
        );
      }

      return { ...inst, subjects, isAnySubjectPending };
    })
    .filter((inst) => inst.subjects.length > 0);

  // 2. Filter instructors based on the search term
  const filteredInstructors = alignedInstructors.filter((inst) => {
    const searchTermLower = searchTerm.toLowerCase();
    const fullName = `${inst.in_fname} ${inst.in_lname}`.toLowerCase();

    const subjectMatch = inst.subjects.some(
      (sub) =>
        sub.sb_name.toLowerCase().includes(searchTermLower) ||
        sub.sb_miscode.toLowerCase().includes(searchTermLower)
    );

    return fullName.includes(searchTermLower) || subjectMatch;
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

        {/* 3. Add the search bar input field in JSX */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search by name, subject, or code..."
            className="w-full max-w-md p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 4. Render the filtered list (or a 'not found' message) */}
        {filteredInstructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstructors.map((inst) => (
              <div
                key={inst.in_instructorID}
                className="relative bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-xl transition"
                onClick={() => setSelectedInstructor(inst)}
              >
                {/* START: REMOVED Evaluation Status Tag from main card div */}
                {/* END: REMOVED Evaluation Status Tag from main card div */}

                {/* ... (instructor card content remains the same) ... */}
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
                <div className="mt-4 space-y-2"> {/* Increased spacing for the new tag */}
                  {inst.subjects.map((sub, index) => {
                    const isEvaluated = isSubjectEvaluated(inst.in_instructorID, sub.sb_subID);
                    return (
                      <div
                        key={index}
                        className="text-sm text-gray-600 flex justify-between items-center bg-gray-50 p-2 rounded" // Added styling for the subject div
                      >
                        <div>
                            {sub.sb_name} ({sub.sb_miscode}) - {sub.sb_course}
                        </div>
                        {/* START: Added Evaluation Status Tag to the subject div */}
                        <div
                          className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full ${
                            !isEvaluated
                              ? "bg-yellow-100 text-yellow-800" // Up for Evaluation
                              : "bg-green-100 text-green-800" // Evaluated
                          }`}
                        >
                          {!isEvaluated ? "Pending" : "Evaluated"}
                        </div>
                        {/* END: Added Evaluation Status Tag to the subject div */}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-8">
            No instructors found matching your search.
          </p>
        )}
      </main>

      {/* --- The Modal logic remains exactly the same --- */}
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
                src={selectedInstructor.face || "/profiles/profile-default.png"}
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
              {selectedInstructor.subjects.map((sub, index) => {
                // Replaced inline check with the reusable function for clarity
                const isEvaluated = isSubjectEvaluated(selectedInstructor.in_instructorID, sub.sb_subID);
                return (
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
                      disabled={isEvaluated}
                      className={
                        isEvaluated
                          ? "bg-gray-400 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
                          : "bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition"
                      }
                      onClick={() => !isEvaluated && handleEvaluateClick(selectedInstructor.in_instructorID, sub.sb_subID)}
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

      <footer className="bg-gray-200 text-center py-4 mt-auto">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)
        </p>
      </footer>
    </div>
  );
}