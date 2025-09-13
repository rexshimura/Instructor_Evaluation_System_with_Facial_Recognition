import React from "react";
import StudentNavBar from "../../components/module_layout/StudentNavBar";

export default function Home() {
  // Retrieve the 03-student data from session storage
  const userString = sessionStorage.getItem("user");
  const student = userString ? JSON.parse(userString) : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <StudentNavBar />

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        {student ? (
          <>
            <h2 className="text-3xl font-bold mb-4">
              Welcome, {student.firstName} {student.lastName}! 🎓
            </h2>
            <p className="text-gray-700">
              {student.course} - Year {student.year}, Semester {student.semester}
            </p>
          </>
        ) : (
          <p className="text-gray-700">Please log in to view the portal.</p>
        )}
      </main>

      <footer className="bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)
        </p>
      </footer>
    </div>
  );
}