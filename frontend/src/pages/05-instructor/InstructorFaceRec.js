// src/InstructorFaceRec.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import VerifyNavBar from "../../components/module_layout/VerifyNavBar";

export default function InstructorFaceRec() {
  const [selectedInstructorID, setSelectedInstructorID] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch instructors from backend
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const response = await fetch("/instructor_list");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setInstructors(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching instructors:", err);
        setError("Failed to load instructors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  const handleViewProfile = () => {
    if (selectedInstructorID) {
      navigate(`/instructor-profile/${selectedInstructorID}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <VerifyNavBar />
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mt-16 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading instructors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <VerifyNavBar />
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mt-16">
          <div className="flex flex-col items-center text-center">
            <FaUserCircle className="text-5xl text-red-500 mb-2" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              {instructors.length === 0 ? "No instructors available" : "Select an instructor"}
            </option>
            {instructors.map((inst) => (
              <option key={inst.in_instructorid} value={inst.in_instructorid}>
                {inst.in_fname} {inst.in_lname} - {inst.in_dept}
              </option>
            ))}
          </select>

          {/* Action Button */}
          <button
            onClick={handleViewProfile}
            disabled={!selectedInstructorID || instructors.length === 0}
            className={`w-full max-w-xs py-3 rounded-full font-semibold transition ${
              selectedInstructorID && instructors.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            {instructors.length === 0 ? "No Instructors Available" : "View Profile"}
          </button>
        </div>

        {/* Instructor Count */}
        <div className="mt-4 text-center text-sm text-gray-500">
          {instructors.length} instructor(s) available
        </div>
      </div>
    </div>
  );
}