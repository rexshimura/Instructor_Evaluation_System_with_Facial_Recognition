import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputText from "../components/module_input/InputText";
import InputDateOfBirth from "../components/module_input/InputDateOfBirth";
import students from "../data/students";
import LoadingOverlay from "../components/module_feedback/LoadingOverlay";

export default function StudentLogin() {
  const [studentId, setStudentId] = useState("");
  const [dob, setDob] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const foundStudent = students.find(
        (s) => s.studentId === studentId && s.dob === dob
      );

      if (foundStudent) {
        sessionStorage.setItem("user", JSON.stringify(foundStudent));
        sessionStorage.setItem("role", "student");
        navigate("/home");
      } else {
        setMessage("❌ Invalid Student ID or Date of Birth.");
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded-xl shadow-lg w-96"
        >
          <h2 className="text-2xl font-bold mb-4">Student Login</h2>
          <InputText
            label="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter your Student ID"
            type="text"
          />
          <InputDateOfBirth
            label="Date of Birth"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-4"
            disabled={isLoading}
          >
            Login
          </button>
          {message && <p className="mt-4 text-center">{message}</p>}
        </form>
        <button
          onClick={() => navigate("/mod")}
          className="absolute bottom-10 text-blue-500 hover:underline"
        >
          Login as Moderator
        </button>
      </div>
      {isLoading && <LoadingOverlay message="Logging In" />}
    </>
  );
}