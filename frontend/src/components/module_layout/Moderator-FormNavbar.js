import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../module_feedback/QuickLoadingOverlay";

export default function ModeratorFormNavBar() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReturnClick = () => {
    setShowConfirm(true);
  };

  const handleYes = () => {
    setShowConfirm(false);
    setLoading(true);

    // simulate a short delay for loading
    setTimeout(() => {
      navigate(-1);
    }, 1500);
  };

  const handleNo = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-blue-800 text-white p-4 flex justify-between items-center relative z-50 rounded-b-md">
        <h1 className="font-bold text-lg">Instructor Registration</h1>
        <button
          onClick={handleReturnClick}
          className="py-2 px-4 rounded-md text-white border border-white hover:bg-white hover:text-blue-800 transition-colors duration-200"
        >
          Return
        </button>
      </nav>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center relative">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <svg
                className="w-12 h-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M5.07 19h13.86a1 1 0 00.93-1.37l-6.93-12a1 1 0 00-1.73 0l-6.93 12a1 1 0 00.93 1.37z"
                />
              </svg>
            </div>

            {/* Message */}
            <p className="text-gray-800 text-lg mb-6 font-medium">
              Are you sure you want to return? <br />
              Your form data will not be saved.
            </p>

            {/* Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={handleYes}
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors font-semibold"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-400 transition-colors font-semibold"
              >
                No
              </button>
            </div>
          </div>

          {/* Fade-in Animation */}
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fade-in 0.2s ease-out forwards;
            }
          `}</style>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && <LoadingOverlay message="Returning... your form data is not saved." />}
    </>
  );
}
