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

  // Helper for Desktop Links
  const NavItem = ({ label, path, icon }) => (
    <Link
      to={path}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-800 transition-colors text-sm font-medium"
    >
      {icon} {label}
    </Link>
  );

  return (
    <>
      {/* Navbar */}
      <nav className="bg-purple-900 text-white shadow-md relative z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">

            {/* LEFT: Logo & Desktop Nav */}
            <div className="flex items-center gap-8">
              <h1 className="font-bold text-xl tracking-wide flex items-center gap-2">
                Admin Panel
              </h1>

              {/* DESKTOP MENU (Hidden until lg) */}
              <div className="hidden lg:flex items-center gap-2">
                {navItems.map((item, idx) => (
                  <NavItem key={idx} label={item.label} path={item.path} icon={item.icon} />
                ))}
              </div>
            </div>

            {/* RIGHT: Logout & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <button
                className="hidden lg:flex items-center gap-2 text-sm font-medium text-purple-200 hover:text-white hover:bg-purple-800 px-3 py-2 rounded-lg transition"
                onClick={handleLogout}
              >
                <FaSignOutAlt /> Logout
              </button>

              {/* Mobile Toggle (Visible until lg) */}
              <button
                className="lg:hidden focus:outline-none p-2 rounded hover:bg-purple-800"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE SLIDE-OUT MENU */}
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden flex flex-col ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="bg-purple-900 p-4 flex justify-between items-center text-white">
            <span className="font-bold text-lg">Menu</span>
            <button onClick={() => setIsMenuOpen(false)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Navigation</div>
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <span className="text-purple-600">{item.icon}</span> {item.label}
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-semibold"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </nav>

      {/* Loading overlay */}
      {isLoading && <LoadingOverlay message="Logging Out..." />}
    </>
  );
}