import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function VerifyNavBar() {
  const navigate = useNavigate();

  return (
    <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-transparent text-gray-800 z-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-lg font-medium hover:text-blue-600 transition"
      >
        <FaArrowLeft className="text-2xl" />
        <span>Back</span>
      </button>
    </nav>
  );
}
