// src/InstructorFaceRec.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import VerifyNavBar from "../../components/module_layout/VerifyNavBar";
import instructors from "../../data/instructors";

export default function InstructorFaceRec() {
  const [selectedInstructorID, setSelectedInstructorID] = useState("");
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (selectedInstructorID) {
      // This is the correct way to navigate to a dynamic URL
      // by using template literals to build the path.
      navigate(`/instructor-profile/${selectedInstructorID}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <VerifyNavBar />
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mt-16">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <FaUserCircle className="text-5xl text-blue-600 mb-2" />
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Face Recognition
          </h2>
          <p className="text-center text-gray-500 text-sm mt-2">
            None for now, so temporarily <br/>please select an instructor from the list below.
          </p>
        </div>

        {/* Instructor Dropdown */}
        <div className="flex flex-col items-center space-y-4">
          <select
            value={selectedInstructorID}
            onChange={(e) => setSelectedInstructorID(e.target.value)}
            className="w-full max-w-xs p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select an instructor</option>
            {instructors.map((instructor) => (
              <option key={instructor.instructorID} value={instructor.instructorID}>
                {`${instructor.fname} ${instructor.lname}`}
              </option>
            ))}
          </select>

          {/* Action button */}
          <button
            onClick={handleViewProfile}
            disabled={!selectedInstructorID}
            className={`w-full max-w-xs py-3 rounded-full font-semibold transition ${
              selectedInstructorID
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}