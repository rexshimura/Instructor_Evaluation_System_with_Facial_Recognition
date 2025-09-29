// --- Loading Overlay (no changes) ---
export const FaceLoadingOverlay = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex flex-col justify-center items-center z-50 animate-fade-in">
    <style>{`
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      .animate-spin { animation: spin 1.5s linear infinite; }
    `}</style>
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-2xl">
      <div className="flex justify-center items-center h-20 w-20 relative">
        <div className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-b-blue-500 border-r-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-xl font-semibold text-gray-800 text-center">
        {message}
      </p>
    </div>
  </div>
);