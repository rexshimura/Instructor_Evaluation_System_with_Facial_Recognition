import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaSearch, FaCamera, FaDatabase, FaUsers } from "react-icons/fa";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { apiService } from "../../../services/apiService";

export default function InstructorFaceSelection() {
  const [instructors, setInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInstructors = async () => {
      try {
        setLoading(true);
        const data = await apiService.getInstructors();
        setInstructors(data);
        setError(null);
      } catch (err) {
        console.error("Error loading instructors:", err);
        setError("Failed to load instructors from database");
      } finally {
        setLoading(false);
      }
    };
    loadInstructors();
  }, []);

  const filteredInstructors = instructors.filter(instructor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      `${instructor.ins_fname} ${instructor.ins_lname}`.toLowerCase().includes(searchLower) ||
      instructor.ins_dept.toLowerCase().includes(searchLower) ||
      instructor.ins_id.toString().includes(searchLower)
    );
  });

  const handleBeginFaceRecording = (instructor) => {
    navigate(`/mod-face-record/${instructor.ins_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <ModeratorNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading instructors from database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ModeratorNavBar />
      
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <FaUserCircle className="text-6xl text-blue-600" />
              <FaCamera className="absolute -bottom-1 -right-1 text-white bg-blue-500 rounded-full p-1 text-sm" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Instructor Face Registration
          </h1>
          <p className="text-gray-600">
            Select an instructor to begin facial recognition registration
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <FaDatabase className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, department, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>{instructors.length} instructors in database</span>
            {searchTerm && (
              <span>{filteredInstructors.length} matching results</span>
            )}
          </div>
        </div>

        {/* Instructors List */}
        <div className="space-y-4">
          {filteredInstructors.length > 0 ? (
            filteredInstructors.map((instructor) => (
              <div
                key={instructor.ins_id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {instructor.ins_fname} {instructor.ins_lname} {instructor.ins_suffix || ''}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>
                        <strong>ID:</strong> {instructor.ins_id}
                      </div>
                      <div>
                        <strong>Department:</strong> {instructor.ins_dept}
                      </div>
                      <div>
                        <strong>Gender:</strong> {instructor.ins_sex}
                      </div>
                    </div>
                    {instructor.ins_email && (
                      <div className="text-sm text-gray-500 mt-1">
                        <strong>Email:</strong> {instructor.ins_email}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleBeginFaceRecording(instructor)}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    <FaCamera />
                    Register Face
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-2">
                {searchTerm ? "No instructors found matching your search" : "No instructors available"}
              </p>
              <p className="text-gray-500">
                {searchTerm ? "Try a different search term" : "Add instructors to the database first"}
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">How to Register a Face:</h3>
          <ol className="text-blue-700 list-decimal list-inside space-y-1 text-sm">
            <li>Select an instructor from the list above</li>
            <li>Click "Register Face" to start the recording process</li>
            <li>Follow the on-screen instructions to capture facial data</li>
            <li>Complete the 3-step face capture process</li>
            <li>Save the registration to the database</li>
          </ol>
        </div>
      </main>
    </div>
  );
}