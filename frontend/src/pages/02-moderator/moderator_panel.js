import React from "react";
import ModeratorNavBar from "../../components/module_layout/ModeratorNavBar";

// Define the path to the default profile image
const DEFAULT_PROFILE_IMAGE = "/profiles/profile-default.png";

export default function ModeratorPanel() {
  const userString = sessionStorage.getItem("user");
  const moderator = userString ? JSON.parse(userString) : null;

  // Add this check for access control
  if (!moderator) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-600">Access Denied. Please log in.</p>
      </div>
    );
  }

  // Helper function to get the full name (Last Name, First Name Middle Initial)
  const getFullName = (mod) => {
    // Only include the middle initial if it exists
    const middleInitial = mod.mod_mname ? ` ${mod.mod_mname}.` : '';
    return `${mod.mod_lname}, ${mod.mod_fname}${middleInitial}`;
  };

  // Helper function to format date from "2025-10-04T16:00:00.000Z" to "2025-10-04"
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      // Split by 'T' and take the first part (the date)
      return dateString.split('T')[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ModeratorNavBar />

      <main className="flex-1 flex flex-col p-8">
        {/* === 1. TOP BANNER AND WELCOME SECTION === */}
        <header className="bg-blue-600 text-white p-6 rounded-lg shadow-xl mb-8">
          <h1 className="text-3xl font-light">
            Welcome, <span className="font-bold">{moderator.mod_username}</span>!
          </h1>
          <p className="mt-1 text-blue-100">
            You are logged in as a System Moderator.
          </p>
        </header>

        {/* === 2. MAIN CONTENT AREA: Divided into sections (Profile and Functions) === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN (1/3 Width): Moderator Profile Details */}
          <section className="lg:col-span-1 bg-white shadow-lg rounded-xl p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Moderator Profile
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
                <p className="text-lg font-semibold text-gray-800">{getFullName(moderator)}</p>
              </div>
              <div className="py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-500">Moderator ID</p>
                <p className="text-lg font-semibold text-gray-800">{moderator.mod_ID}</p>
              </div>
              <div className="py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="text-lg font-semibold text-gray-800">{moderator.mod_username}</p>
              </div>
              <div className="py-2">
                <p className="text-sm font-medium text-gray-500">Account Created</p>
                <p className="text-base text-gray-700">{formatDate(moderator.date_created)} by {moderator.created_by}</p>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN (2/3 Width): System Management Overview */}
          <section className="lg:col-span-2 bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              System Management Overview
            </h2>

            <p className="text-gray-700 mb-6">
              Use the navigation bar above or the quick-access cards below to manage the system.
            </p>

            {/* Functional Quick-Access Cards with new links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Card 1: View Instructors (Renamed) */}
              <a href="/mod-instructor-list" className="block p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-green-700 group-hover:text-green-900">View Instructors</h3>
                <p className="text-sm text-gray-500">View and search details of existing faculty and instructor profiles.</p>
              </a>

              {/* Card 2: Register Instructor (New Card) */}
              <a href="/mod-register-instructor" className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-blue-700 group-hover:text-blue-900">Register Instructor</h3>
                <p className="text-sm text-gray-500">Input new instructor's personal info, contacts, and subject load.</p>
              </a>

              {/* Card 3: Register Face (Existing Card) */}
              <a href="/mod-record-face" className="block p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-indigo-700 group-hover:text-indigo-900">Register Face</h3>
                <p className="text-sm text-gray-500">Capture and register facial recognition data for new instructors.</p>
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