// src/InstructorFaceRec.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSearch, FaSync, FaExclamationTriangle } from "react-icons/fa";
import VerifyNavBar from "../../components/module_layout/VerifyNavBar";

export default function InstructorFaceRec() {
  const [selectedInstructorID, setSelectedInstructorID] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/instructors");
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load instructors`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }
      
      setInstructors(data);
      setFilteredInstructors(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching instructors:", err);
      setError(err.message || "Failed to load instructors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, [retryCount]);

  useEffect(() => {
    // Filter instructors based on search term
    if (searchTerm.trim() === "") {
      setFilteredInstructors(instructors);
    } else {
      const filtered = instructors.filter(instructor => 
        `${instructor.ins_fname} ${instructor.ins_mname} ${instructor.ins_lname} ${instructor.ins_suffix || ''} ${instructor.ins_dept}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredInstructors(filtered);
    }
  }, [searchTerm, instructors]);

  const handleViewProfile = () => {
    if (selectedInstructorID) {
      navigate(`/instructor-profile/${selectedInstructorID}`);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };

  const getInstructorDisplayName = (instructor) => {
    const nameParts = [
      instructor.ins_fname,
      instructor.ins_mname,
      instructor.ins_lname,
      instructor.ins_suffix
    ].filter(part => part && part.trim() !== '');
    
    return `${nameParts.join(' ')} - ${instructor.ins_dept}`;
  };

  const LoadingSpinner = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <VerifyNavBar />
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mt-16 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading instructors...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <VerifyNavBar />
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mt-16">
        <div className="flex flex-col items-center text-center">
          <FaExclamationTriangle className="text-5xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-gray-600 text-sm mb-6">
            Unable to connect to the server. Please check your internet connection and try again.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaSync className="text-sm" />
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState />;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <VerifyNavBar />
      
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl p-8 mt-16">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <FaUserCircle className="text-6xl text-blue-600" />
            <div className="absolute -bottom-1 -right-1 bg-blue-100 rounded-full p-1">
              <FaUserCircle className="text-blue-500 text-sm" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Instructor Selection
          </h2>
          <p className="text-center text-gray-500 text-sm">
            Face recognition is not available yet. <br />
            Please select an instructor from the list below.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search instructors by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              Found {filteredInstructors.length} instructor(s) matching "{searchTerm}"
            </p>
          )}
        </div>

        {/* Selection Section */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Instructor:
            </label>
            <select
              value={selectedInstructorID}
              onChange={(e) => setSelectedInstructorID(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="" disabled>
                {filteredInstructors.length === 0 ? "No instructors found" : "Choose an instructor..."}
              </option>
              {filteredInstructors.map((instructor) => (
                <option key={instructor.ins_id} value={instructor.ins_id}>
                  {getInstructorDisplayName(instructor)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleViewProfile}
            disabled={!selectedInstructorID || filteredInstructors.length === 0}
            className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              selectedInstructorID && filteredInstructors.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            <FaUserCircle />
            {filteredInstructors.length === 0 ? "No Instructors Available" : "View Instructor Profile"}
          </button>
        </div>

        {/* Statistics Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Total Instructors: {instructors.length}</span>
            <span>Showing: {filteredInstructors.length}</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 text-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition"
          >
            <FaSync className="text-xs" />
            Refresh List
          </button>
        </div>
      </div>

      {/* Development Note */}
      <div className="mt-6 max-w-2xl w-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Development Note</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Face recognition functionality is currently under development. 
                For now, please use the manual selection method above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}