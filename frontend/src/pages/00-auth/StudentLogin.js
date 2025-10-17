import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputText from "../../components/module_input/InputText";
import InputDateOfBirth from "../../components/module_input/InputDateOfBirth";
import LoadingOverlay from "../../components/module_feedback/LoadingOverlay";
import { FaArrowLeft, FaUserShield } from "react-icons/fa";
import axios from "axios"

export default function StudentLogin() {
  const [studentId, setStudentId] = useState("");
  const [dob, setDob] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validate inputs
    if (!studentId.trim()) {
      setMessage("❌ Please enter Student ID");
      setIsLoading(false);
      return;
    }

    if (!dob) {
      setMessage("❌ Please enter Date of Birth");
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("/students/login", {
        studentId: studentId.trim(),
        dob: dob,
      });

      // ✅ Save logged-in student in session - matching backend response structure
      const studentData = res.data.student;
      sessionStorage.setItem("user", JSON.stringify(studentData));
      sessionStorage.setItem("role", "student");
      sessionStorage.setItem("studentId", studentData.stud_id);

      console.log("Student login successful:", studentData);
      navigate("/home");
    } catch (err) {
      // ✅ Enhanced error handling based on backend responses
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.message) {
          setMessage(`❌ ${errorData.message}`);
        } else if (errorData.error) {
          setMessage(`❌ ${errorData.error}`);
        } else {
          setMessage("❌ Invalid Student ID or Date of Birth.");
        }
      } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
        setMessage("❌ Cannot connect to server. Please try again later.");
      } else {
        setMessage("❌ Invalid Student ID or Date of Birth.");
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Image with Text Overlay */}
        <div
          className="hidden md:block bg-cover bg-center relative"
          style={{ backgroundImage: "url('/png/banner/banner-05.png')" }}
        >
          <div className="absolute bottom-0 left-0 w-full p-4 bg-black/50 text-white text-xs">
            <p>Image Taken from Cebu Technological University - Main</p>
            <p>Captured by: JP Mahilom</p>
            <p>Made By RavenLabs Development Group, all rights reserved</p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-white flex flex-col justify-center items-center p-8 relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-8 right-8 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
          >
            <FaArrowLeft />
            <span>Return</span>
          </button>

          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold mb-2">
              Pro<span className="text-blue-400">Ev</span>
            </h1>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Student Login
            </h2>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <InputText
                  label="Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your Student ID"
                  type="text"
                  required
                />
                <InputDateOfBirth
                  label="Date of Birth"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-grow bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={isLoading || !studentId || !dob}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>

                <div className="relative group">
                  <Link
                    to="/modr-login"
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition"
                  >
                    <FaUserShield size={20} />
                  </Link>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Login as Moderator Instead
                  </span>
                </div>
              </div>

              {message && (
                <p className="mt-4 text-center text-red-500">{message}</p>
              )}
            </form>

            {/* Student Information Helper */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Login Information</h3>
              <p className="text-xs text-blue-600">
                • Student IDs are automatically generated (YYYY + 4 digits)
                <br />
                • Use your registered Date of Birth
                <br />
                • Contact administrator for login issues
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading && <LoadingOverlay message="Logging In" />}
    </>
  );
}