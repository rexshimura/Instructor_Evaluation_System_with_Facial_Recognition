import React from "react";

/**
 * A lightweight, modern loading overlay for quick transitions.
 */
export default function QuickLoadingOverlay({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200">

      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center min-w-[200px] border border-slate-100 transform transition-transform duration-200 scale-100">

        {/* Modern Dual-Ring Spinner */}
        <div className="relative w-12 h-12 mb-4">
          {/* Static Background Ring */}
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          {/* Spinning Active Ring */}
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Message */}
        <p className="text-slate-700 font-bold text-lg animate-pulse">
          {message}
        </p>

      </div>
    </div>
  );
}