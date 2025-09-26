// LandingPage.js

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserGraduate, FaChalkboardTeacher, FaShieldAlt } from "react-icons/fa";
import ScrollToTopButton from "../components/module_feedback/ScrollToTopButton";
import GeneralFooter from "../components/module_layout/GeneralFooter";

export default function LandingPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-transparent text-white z-20">
        <h1 className="text-2xl font-bold">
          Pro<span className="text-blue-400">Ev</span>
        </h1>
        <div className="flex items-center space-x-8">
          <a href="#about" className="hover:text-blue-400 transition">About</a>
          {/* New "Verify Instructor" button */}
          <Link
            to="/verify-instructor"
            className="hover:text-blue-400 transition"
          >
            Verify Instructor
          </Link>
          {/* Login Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="hover:text-blue-400 transition flex items-center"
            >
              Login
              <svg
                className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-30 text-gray-700">
                <Link to="/stud-login" className="block px-4 py-2 hover:bg-blue-50">Student Login</Link>
                <Link to="/modr-login" className="block px-4 py-2 hover:bg-blue-50">Moderator Login</Link>
                <Link to="/admn-login" className="block px-4 py-2 hover:bg-blue-50">Admin Login</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center text-center text-white min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/png/bg/landing-bg-01.png')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-3xl px-6">
          <h2 className="text-5xl font-bold mb-4">Welcome to ProEv</h2>
          <p className="text-lg mb-6">
            Instructor Profiling and Evaluation System with Facial Recognition
          </p>
          <Link
            to="/stud-login"
            className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition"
          >
            Evaluate Now
          </Link>
        </div>
      </section>

      {/* About + Features Combined */}
      <section id="about" className="py-16 px-6 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-600">About ProEv</h2>
          <p className="text-lg leading-relaxed text-justify mb-12">
            ProEv is a modern academic platform designed to improve the process
            of instructor profiling and evaluation. By using facial recognition,
            it ensures that evaluations are secure, authentic, and free from
            fraudulent activity. Students can provide accurate feedback with
            ease, while institutions receive valuable insights into teaching
            effectiveness. ProEv strengthens academic integrity and promotes
            continuous improvement in education quality.
          </p>

          {/* Features as cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
              <FaUserGraduate className="text-blue-600 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Student-Friendly</h3>
              <p className="text-gray-600">
                Provides a seamless experience for students to evaluate their
                instructors quickly and easily.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
              <FaChalkboardTeacher className="text-blue-600 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Instructor Insights</h3>
              <p className="text-gray-600">
                Generates detailed reports that help instructors recognize
                strengths and improve on weaknesses.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition">
              <FaShieldAlt className="text-blue-600 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Evaluations</h3>
              <p className="text-gray-600">
                Facial recognition ensures evaluations are authentic and free
                from tampering.
              </p>
            </div>
          </div>
        </div>
      </section>
      <ScrollToTopButton />
      <GeneralFooter/>
    </div>
  );
}