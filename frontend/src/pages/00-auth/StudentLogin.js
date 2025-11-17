import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputText from "../../components/module_input/InputText";
import InputDateOfBirth from "../../components/module_input/InputDateOfBirth";
import LoadingOverlay from "../../components/module_feedback/LoadingOverlay";
import { FaArrowLeft, FaUserShield, FaQuestionCircle, FaTimes, FaInfoCircle } from "react-icons/fa";
import axios from "axios"

export default function StudentLogin() {
  const [studentId, setStudentId] = useState("");
  const [dob, setDob] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State for the Help Modal
  const [showHelp, setShowHelp] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

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

      const studentData = res.data.student;
      sessionStorage.setItem("user", JSON.stringify(studentData));
      sessionStorage.setItem("role", "student");
      sessionStorage.setItem("studentId", studentData.stud_id);

      console.log("Student login successful:", studentData);
      navigate("/home");
    } catch (err) {
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
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Column: Image (Fade In) */}
        <div
          className="hidden md:block bg-cover bg-center relative animate-fade-in"
          style={{ backgroundImage: "url('/png/banner/banner-05.png')" }}
        >
          <div className="absolute bottom-0 left-0 w-full p-4 bg-black/50 text-white text-xs backdrop-blur-sm">
            <p>Image Taken from Cebu Technological University - Main</p>
            <p>Captured by: JP Mahilom</p>
            <p>Made By RavenLabs Development Group, all rights reserved</p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-white flex flex-col justify-center items-center p-8 relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-8 right-8 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition animate-slide-up delay-500"
          >
            <FaArrowLeft />
            <span>Return</span>
          </button>

          <div className="w-full max-w-sm">
            <div className="animate-slide-up delay-100">
                <h1 className="text-3xl font-bold mb-2">
                Pro<span className="text-blue-400">Ev</span>
                </h1>

                {/* Header with Help Toggle Button */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Student Login
                    </h2>
                    <button
                        onClick={() => setShowHelp(true)}
                        className="text-gray-400 hover:text-blue-600 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                        title="How to login?"
                        type="button"
                    >
                        <FaQuestionCircle size={20} />
                    </button>
                </div>
            </div>

            <form onSubmit={handleLogin}>
              <div className="space-y-4 animate-slide-up delay-200">
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

              <div className="mt-6 flex items-center gap-3 animate-slide-up delay-300">
                <button
                  type="submit"
                  className="flex-grow bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-200"
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
                <p className="mt-4 text-center text-red-500 animate-slide-up">{message}</p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* --- HELP POPUP MODAL --- */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop (Click to close) */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowHelp(false)}
          ></div>

          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-800 font-bold">
                    <FaInfoCircle /> Login Guide
                </div>
                <button
                    onClick={() => setShowHelp(false)}
                    className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                >
                    <FaTimes />
                </button>
            </div>

            {/* Body */}
            <div className="p-6 text-slate-700 space-y-4">
                <div>
                    <p className="font-bold text-sm text-slate-900 mb-1">Student ID Format</p>
                    <p className="text-sm text-slate-600">
                        IDs are automatically generated. Example: <span className="font-mono bg-slate-100 px-1 rounded">20240123</span> (Year + 4 digits).
                    </p>
                </div>

                <div>
                    <p className="font-bold text-sm text-slate-900 mb-1">Password / Date of Birth</p>
                    <p className="text-sm text-slate-600">
                        Use the Date of Birth you submitted during registration.
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-800 flex gap-2 items-start">
                    <div className="mt-0.5">⚠️</div>
                    <p>Having trouble? Please contact the system administrator or your department head.</p>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 text-right">
                <button
                    onClick={() => setShowHelp(false)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition shadow-sm"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && <LoadingOverlay message="Logging In" />}
    </>
  );
}