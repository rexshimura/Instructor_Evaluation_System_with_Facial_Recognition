import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ModeratorFormNavBar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-blue-800 text-white p-4 flex justify-between items-center relative z-50 rounded-b-md">
      <h1 className="font-bold text-lg">Instructor Registration</h1>
      <button
        onClick={() => navigate(-1)}
        className="py-2 px-4 rounded-md text-white border border-white hover:bg-white hover:text-blue-800 transition-colors duration-200"
      >
        Return
      </button>
    </nav>
  );
}
