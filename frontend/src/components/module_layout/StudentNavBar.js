import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingOverlay from "../module_feedback/LoadingOverlay";

export default function StudentNavBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoading(true);

    setTimeout(() => {
      sessionStorage.removeItem("user");
      navigate("/");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center relative z-50">
        <h1 className="font-bold text-lg">Student Portal</h1>

        {/* Mobile menu button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>

        {/* Desktop menu */}
        <ul className="hidden md:flex gap-6 items-center">
          <li className="hover:underline cursor-pointer">
            <Link to="/home">Home</Link>
          </li>
          <li className="hover:underline cursor-pointer">
            <Link to="/instructor-list">Evaluate</Link>
          </li>
          <li className="hover:underline cursor-pointer" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </nav>

      {/* Mobile menu and overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
             onClick={() => setIsMenuOpen(false)}>
        </div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-60 bg-blue-600 text-white p-4 z-50 transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-end mb-4">
          <button onClick={() => setIsMenuOpen(false)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <ul className="flex flex-col gap-4">
          <li className="hover:underline cursor-pointer" onClick={() => setIsMenuOpen(false)}>
            <Link to="/home">Home</Link>
          </li>
          <li className="hover:underline cursor-pointer" onClick={() => setIsMenuOpen(false)}>
            <Link to="/test">Evaluate</Link>
          </li>
          <li className="hover:underline cursor-pointer" onClick={() => { handleLogout(); setIsMenuOpen(false); }}>
            Logout
          </li>
        </ul>
      </div>

      {/* Conditionally render the loading overlay */}
      {isLoading && <LoadingOverlay message="Logging Out" />}
    </>
  );
}