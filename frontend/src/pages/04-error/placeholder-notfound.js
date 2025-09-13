import React from 'react';
import { useNavigate } from 'react-router-dom';

// This is a simple, single-file component for a "Not Found" page.
// All styles are included using Tailwind CSS classes.
const App = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
      <div className="text-center">
        {/* The main "404" heading */}
        <h1 className="text-8xl md:text-9xl font-extrabold text-gray-700 leading-none">
          404
        </h1>
        {/* Subtitle to give context */}
        <p className="text-2xl md:text-3xl font-semibold mt-4">
          Page Not Found
        </p>
        {/* A friendly message */}
        <p className="mt-2 text-lg text-gray-600">
          The page you were looking for doesn't exist.
        </p>
        {/* A button to guide the user back to the previous page */}
        <button
          onClick={() => navigate(-1)}
          className="inline-block mt-6 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Return to Previous Page
        </button>
      </div>
    </div>
  );
};

export default App;
