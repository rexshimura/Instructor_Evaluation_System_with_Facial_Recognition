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
    const middleInitial = stud.stud_mname ? ` ${stud.stud_mname.charAt(0)}.` : '';
    const suffix = stud.stud_suffix ? ` ${stud.stud_suffix}` : '';
    return `${stud.stud_lname}, ${stud.stud_fname}${middleInitial}${suffix}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <StudentNavBar />

      <main className="flex-1 flex flex-col p-8">
        {/* === 1. TOP BANNER AND WELCOME SECTION === */}
        <header className="bg-blue-600 text-white p-6 rounded-lg shadow-xl mb-8">
          <h1 className="text-3xl font-light">
            Welcome, <span className="font-bold">{student.stud_fname}</span>! 🎓
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
                <p className="text-lg font-semibold text-gray-800">{student.stud_id}</p>
              </div>
              <div className="py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-500">Program / Course</p>
                <p className="text-lg font-semibold text-gray-800">{student.stud_course}</p>
              </div>
              <div className="py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-500">Year Level</p>
                <p className="text-base text-gray-700">Year {student.stud_year}</p>
              </div>
              <div className="py-2">
                <p className="text-sm font-medium text-gray-500">Semester</p>
                <p className="text-base text-gray-700">Semester {student.stud_semester}</p>
              </div>
              {student.stud_sex && (
                <div className="py-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-base text-gray-700">{student.stud_sex}</p>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN (2/3 Width): System Quick Access */}
          <section className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Evaluation System
            </h2>

            <p className="text-gray-700 mb-6">
              Welcome to the Faculty Evaluation System. Evaluate instructors based on your enrolled sections and subjects.
            </p>

            {/* Functional Quick-Access Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Card 1: Evaluate Instructor */}
              <a href="/instructor-list" className="block p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-green-700 group-hover:text-green-900">Evaluate Instructor</h3>
                <p className="text-sm text-gray-500">Select an instructor from your sections to submit evaluations.</p>
              </a>

              {/* Card 2: View Evaluations */}
              <a href="/student-history" className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-900">My Evaluations</h3>
                <p className="text-sm text-gray-500">View your submitted evaluations and ratings history.</p>
              </a>

              {/* Card 3: My Sections
              <a href="/my-sections" className="block p-4 border border-gray-200 rounded-lg hover:bg-orange-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-orange-700 group-hover:text-orange-900">My Sections</h3>
                <p className="text-sm text-gray-500">View your enrolled sections and assigned instructors.</p>
              </a> */}

              {/* Card 4: Available Instructors
              <a href="/available-instructors" className="block p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-purple-700 group-hover:text-purple-900">Available Instructors</h3>
                <p className="text-sm text-gray-500">Browse instructors you can evaluate based on your sections.</p>
              </a> */}

              {/* Card 5: Evaluation Guidelines */}
              <a href="/guidelines" className="block p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-indigo-700 group-hover:text-indigo-900">Guidelines</h3>
                <p className="text-sm text-gray-500">Learn about the evaluation criteria and process.</p>
              </a>

              {/* Card 6: Profile Settings
              <a href="/student-profile" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-gray-700 group-hover:text-gray-900">Profile Settings</h3>
                <p className="text-sm text-gray-500">Update your personal information and preferences.</p>
              </a> */}

            </div>

            {/* Information Section */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">How Evaluation Works</h3>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• You can only evaluate instructors assigned to your sections</li>
                <li>• Each evaluation covers 5 criteria (C1-C5) with ratings 1-5</li>
                <li>• You can evaluate each instructor-subject combination once</li>
                <li>• Evaluations are anonymous and confidential</li>
              </ul>
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