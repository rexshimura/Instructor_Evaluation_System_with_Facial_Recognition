import React from "react";
import StudentNavBar from "../../components/module_layout/StudentNavBar";

// Define the path to the default profile image
const DEFAULT_PROFILE_IMAGE = "/profiles/profile-default.png";

export default function Home() {
  const userString = sessionStorage.getItem("user");
  const student = userString ? JSON.parse(userString) : null;

  // Add this check for access control
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-600">Access Denied. Please log in.</p>
      </div>
    );
  }

  // Helper function to get the full name (Last Name, First Name Middle Initial)
  const getFullName = (stud) => {
    // Only include the middle initial if it exists
    const middleInitial = stud.st_mname ? ` ${stud.st_mname.charAt(0)}.` : '';
    return `${stud.st_lname}, ${stud.st_fname}${middleInitial}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <StudentNavBar />

      <main className="flex-1 flex flex-col p-8">
        {/* === 1. TOP BANNER AND WELCOME SECTION === */}
        <header className="bg-blue-600 text-white p-6 rounded-lg shadow-xl mb-8">
          <h1 className="text-3xl font-light">
            Welcome, <span className="font-bold">{student.st_fname}</span>! 🎓
          </h1>
          <p className="mt-1 text-blue-100">
            You are logged in as a Student.
          </p>
        </header>

        {/* === 2. MAIN CONTENT AREA: Divided into sections (Profile and Functions) === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN (1/3 Width): Student Profile Details */}
          <section className="lg:col-span-1 bg-white shadow-lg rounded-xl p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Student Profile
            </h2>

            {/* Profile Image (Circled) */}
            <div className="flex justify-center mb-6">
              <img
                src={DEFAULT_PROFILE_IMAGE}
                alt="Profile Default"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
              />
            </div>

            {/* Profile Details List */}
            <div className="text-left space-y-3">
              <div className="py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-lg font-semibold text-gray-800">{getFullName(student)}</p>
              </div>
              <div className="py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-500">Student ID</p>
                <p className="text-lg font-semibold text-gray-800">{student.st_studID}</p>
              </div>
              <div className="py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-500">Program / Course</p>
                <p className="text-lg font-semibold text-gray-800">{student.st_course}</p>
              </div>
              <div className="py-2">
                <p className="text-sm font-medium text-gray-500">Year & Section</p>
                <p className="text-base text-gray-700">Year {student.st_year} - Section {student.st_section}</p>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN (2/3 Width): System Quick Access */}
          <section className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              System Quick Access
            </h2>

            <p className="text-gray-700 mb-6">
              Use the navigation bar above or the quick-access card below to navigate the system.
            </p>

            {/* Functional Quick-Access Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Card 1: Evaluate Instructor */}
              <a href="/instructor-list" className="block p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-green-700 group-hover:text-green-900">Evaluate Instructor</h3>
                <p className="text-sm text-gray-500">Select an instructor to view their profile and submit an evaluation.</p>
              </a>

            </div>
          </section>

        </div>
      </main>

      <footer className="bg-white text-center py-4 border-t border-gray-200 mt-auto">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)
        </p>
      </footer>
    </div>
  );
}