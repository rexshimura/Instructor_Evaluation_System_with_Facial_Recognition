import React from "react";

// --- Modern Face Loading Overlay ---
export const FaceLoadingOverlay = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">

    {/* Card Container */}
    <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full mx-4 border border-slate-100 animate-scale-in">

      {/* Modern Dual-Ring Spinner */}
      <div className="relative w-16 h-16 mb-6">
        {/* Static Background Ring */}
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        {/* Spinning Active Ring */}
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>

      {/* Message */}
      <h3 className="text-lg font-bold text-slate-800 text-center animate-pulse">
        {message}
      </h3>

      <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">
        Processing Biometrics
      </p>
    </div>
  </div>
);