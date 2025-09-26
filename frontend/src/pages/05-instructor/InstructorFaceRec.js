// src/InstructorFaceRec.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import VerifyNavBar from "../../components/module_layout/VerifyNavBar";
import rawInstructorData from "../../data/list-instructors";

// Normalize instructor data in case it's wrapped
const instructors = Array.isArray(rawInstructorData)
  ? rawInstructorData
  : rawInstructorData.instructors || [];

export default function InstructorFaceRec() {
  const [selectedInstructorID, setSelectedInstructorID] = useState("");
  const navigate = useNavigate();

  const handleViewProfile = () => {
    if (selectedInstructorID) {
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
            Face recognition is not available yet. <br />
            Please select an instructor from the list below.
          </p>
        </div>

        {/* Instructor Dropdown */}
        <div className="flex flex-col items-center space-y-4">
          <select
            value={selectedInstructorID}
            onChange={(e) => setSelectedInstructorID(e.target.value)}
            className="w-full max-w-xs p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select an instructor
            </option>
            {instructors.map((inst) => (
              <option key={inst.in_instructorID} value={inst.in_instructorID}>
                {inst.in_fname} {inst.in_lname} - {inst.in_dept}
              </option>
            ))}
          </select>

          {/* Action Button */}
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
