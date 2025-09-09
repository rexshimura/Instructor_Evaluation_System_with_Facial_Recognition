import React from "react";

export default function LoadingOverlay({ message }) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex flex-col justify-center items-center z-50">
      <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-xl">
        {/* Loading Spinner */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        {/* Loading Message */}
        <p className="text-xl font-semibold text-gray-800">{message}</p>
      </div>
    </div>
  );
}