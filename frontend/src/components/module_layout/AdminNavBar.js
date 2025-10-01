import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUserTie,
  FaSignOutAlt,
  FaBook,
  FaChartBar,
} from "react-icons/fa";
import LoadingOverlay from "../module_feedback/LoadingOverlay";

export default function AdminNavBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      sessionStorage.clear(); // clear all session data
      navigate("/admn-login");
      setIsLoading(false);
    }, 1000);
  };

  const navItems = [
    { label: "Home", path: "/adm-panel", icon: <FaHome /> },
    { label: "Moderators", path: "/adm-moderator-list", icon: <FaUserTie /> },
    { label: "Instructors", path: "/adm-instructor-list", icon: <FaUsers /> },
    { label: "Curriculum", path: "/adm-curriculum", icon: <FaBook /> },
    { label: "Statistics", path: "/adm-statistics", icon: <FaChartBar /> },
  ];

  return (
    <>
      {/* Navbar */}
      <nav className="bg-purple-900 text-white p-4 flex justify-between items-center relative z-50">
        <h1 className="font-bold text-lg">Admin Panel</h1>

        {/* Mobile toggle */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Desktop menu */}
        <ul className="hidden md:flex gap-6 items-center">
          {navItems.map((item, idx) => (
            <li
              key={idx}
              className="hover:underline cursor-pointer flex items-center gap-2"
            >
              {item.icon}
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
          <li
            className="hover:underline cursor-pointer flex items-center gap-2"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </nav>

      {/* Mobile overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile slide-out */}
      <div
        className={`fixed top-0 right-0 h-full w-60 bg-purple-800 text-white p-4 z-50 transform transition-transform duration-300 ease-in-out
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-end mb-4">
          <button onClick={() => setIsMenuOpen(false)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col gap-4">
          {navItems.map((item, idx) => (
            <li
              key={idx}
              className="hover:underline cursor-pointer flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon}
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
          <li
            className="hover:underline cursor-pointer flex items-center gap-2"
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
          >
            <FaSignOutAlt /> Logout
          </li>
        </ul>
      </div>

      {/* Loading overlay */}
      {isLoading && <LoadingOverlay message="Logging Out..." />}
    </>
  );
}