import React from "react";
import { useLocation } from "react-router-dom";

export default function Home() {
  const location = useLocation();
  const student = location.state?.student;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="font-bold text-lg">Student Portal</h1>
        <ul className="flex gap-6">
          <li className="hover:underline cursor-pointer">Home</li>
          <li className="hover:underline cursor-pointer">Evaluate</li>
          <li className="hover:underline cursor-pointer">Logout</li>
        </ul>
      </nav>

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
          <p className="text-gray-700">Welcome to the Student Portal 🎓</p>
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
