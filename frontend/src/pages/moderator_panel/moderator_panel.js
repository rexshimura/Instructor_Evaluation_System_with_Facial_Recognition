import React from "react";
import ModeratorNavBar from "../../components/module_layout/ModeratorNavBar";

export default function ModeratorPanel() {
  const userString = sessionStorage.getItem("user"); // Correct key is now "user"
  const moderator = userString ? JSON.parse(userString) : null;

  // Add this check to prevent the error
  if (!moderator) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-600">Access Denied. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ModeratorNavBar />

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-3xl font-bold mb-4">
          Welcome, {moderator.mod_fname} {moderator.mod_lname}!
        </h2>
        <p className="text-gray-700">This is your Moderator Panel.</p>
        <p className="text-gray-700">
          From here, you can manage the system's instructors and facial recognition data.
        </p>
      </main>

      <footer className="bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)
        </p>
      </footer>
    </div>
  );
}