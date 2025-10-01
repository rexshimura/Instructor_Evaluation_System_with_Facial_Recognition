import React from "react";
import AdminNavBar from "../../components/module_layout/AdminNavBar";

// Define the path to the default profile image
const ADMIN_PROFILE_IMAGE = "/profiles/profile-admin.png";

export default function AdminPanel() {
  const userString = sessionStorage.getItem("user");
  const admin = userString ? JSON.parse(userString) : null;

  // Add this check to prevent access without logging in
  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-600">Access Denied. Please log in.</p>
      </div>
    );
  }

  // Helper function to get the full name (Last Name, First Name Middle Initial)
  const getFullName = (adm) => {
    // Only include the middle initial if it exists
    const middleInitial = adm.adm_mname ? ` ${adm.adm_mname}` : '';
    return `${adm.adm_lname}, ${adm.adm_fname}${middleInitial}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminNavBar />

      <main className="flex-1 flex flex-col p-8">
        {/* === 1. TOP BANNER AND WELCOME SECTION === */}
        <header className="bg-purple-800 text-white p-6 rounded-lg shadow-xl mb-8">
          <h1 className="text-3xl font-light">
            Welcome, <span className="font-bold">{admin.adm_username}</span>!
          </h1>
          <p className="mt-1 text-purple-100">
            You are logged in as a System Administrator.
          </p>
        </header>

        {/* === 2. MAIN CONTENT AREA: Divided into Profile and Functions === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN (1/3 Width): Admin Profile Details */}
          <section className="lg:col-span-1 bg-white shadow-lg rounded-xl p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Admin Profile
            </h2>

            {/* Profile Image (Circled) */}
            <div className="flex justify-center mb-6">
              <img
                src={ADMIN_PROFILE_IMAGE}
                alt="Profile Default"
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-md"
              />
            </div>

            {/* Profile Details List */}
            <div className="text-left space-y-3">
              <div className="py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-lg font-semibold text-gray-800">{getFullName(admin)}</p>
              </div>
              <div className="py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-500">Admin ID</p>
                <p className="text-lg font-semibold text-gray-800">{admin.adm_ID}</p>
              </div>
              <div className="py-2">
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="text-lg font-semibold text-gray-800">{admin.adm_username}</p>
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

            {/* Functional Quick-Access Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Card 1: Moderator List */}
              <a href="/adm-moderator-list" className="block p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-purple-700 group-hover:text-purple-900">Moderator List</h3>
                <p className="text-sm text-gray-500">Add or remove moderator accounts and view their activity logs.</p>
              </a>

              {/* Card 2: Instructor List */}
              <a href="/adm-instructor-list" className="block p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-green-700 group-hover:text-green-900">Instructor List</h3>
                <p className="text-sm text-gray-500">See all instructors and their individual performance evaluations.</p>
              </a>

              {/* Card 3: Curriculum */}
              <a href="/adm-curriculum" className="block p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-yellow-700 group-hover:text-yellow-900">Curriculum</h3>
                <p className="text-sm text-gray-500">Manage academic courses and add or update subject information.</p>
              </a>

              {/* Card 4: Statistics */}
              <a href="/adm-statistics" className="block p-4 border border-gray-200 rounded-lg hover:bg-red-50 transition duration-150 group">
                <h3 className="text-lg font-semibold text-red-700 group-hover:text-red-900">Statistics</h3>
                <p className="text-sm text-gray-500">View overview performance analytics for specific academic courses.</p>
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