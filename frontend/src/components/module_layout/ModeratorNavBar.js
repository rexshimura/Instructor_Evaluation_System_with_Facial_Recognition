import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaUserPlus,
  FaIdCard,
  FaSignOutAlt,
  FaClipboardList,
  FaChalkboardTeacher,
  FaChevronDown,
  FaLayerGroup
} from "react-icons/fa";
import LoadingOverlay from "../module_feedback/LoadingOverlay";

export default function ModeratorNavBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State for handling dropdowns
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      sessionStorage.clear();
      navigate("/modr-login");
      setIsLoading(false);
    }, 1000);
  };

  const toggleDropdown = (name) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  // --- NAVIGATION GROUPS ---

  const instructorGroup = [
    { label: "Instructor List", path: "/mod-instructor-list", icon: <FaUsers /> },
    { label: "Register New", path: "/mod-register-instructor", icon: <FaUserPlus /> },
    { label: "Record Face Data", path: "/instructor-face-selection", icon: <FaIdCard /> },
    { label: "Assign Sections", path: "/mod-instructor-sections", icon: <FaClipboardList /> },
  ];

  const managementGroup = [
    { label: "Manage Students", path: "/mod-student-list", icon: <FaUsers /> },
    { label: "Manage Sections", path: "/mod-section-list", icon: <FaChalkboardTeacher /> },
  ];

  // --- HELPER COMPONENTS ---

  const DropdownLink = ({ item }) => (
    <Link
      to={item.path}
      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 last:border-0"
    >
      <span className="text-blue-500">{item.icon}</span>
      {item.label}
    </Link>
  );

  const NavItem = ({ label, path, icon }) => (
    <Link
      to={path}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      {icon} {label}
    </Link>
  );

  return (
    <>
      <nav className="bg-blue-800 text-white shadow-md relative z-50" ref={dropdownRef}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">

            {/* LEFT: Logo & Desktop Nav */}
            <div className="flex items-center gap-8">
              {/* UPDATED LOGO TEXT */}
              <h1 className="font-bold text-xl tracking-wide flex items-center gap-2">
                  Moderator Panel
              </h1>

              {/* DESKTOP MENU - Hidden until Large Screen (lg:flex) */}
              <div className="hidden lg:flex items-center gap-2">
                {/* 1. Home */}
                <NavItem label="Home" path="/mod-panel" icon={<FaHome />} />

                {/* 2. Instructors Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('instructors')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeDropdown === 'instructors' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
                  >
                    <FaChalkboardTeacher /> Instructors <FaChevronDown className={`text-xs transition-transform ${activeDropdown === 'instructors' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'instructors' && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 animate-slide-up overflow-hidden border border-blue-100">
                      {instructorGroup.map((item, idx) => <DropdownLink key={idx} item={item} />)}
                    </div>
                  )}
                </div>

                {/* 3. Management Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('management')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${activeDropdown === 'management' ? 'bg-blue-900' : 'hover:bg-blue-700'}`}
                  >
                    <FaLayerGroup /> Management <FaChevronDown className={`text-xs transition-transform ${activeDropdown === 'management' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'management' && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 animate-slide-up overflow-hidden border border-blue-100">
                      {managementGroup.map((item, idx) => <DropdownLink key={idx} item={item} />)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Logout & Mobile Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-lg transition"
              >
                <FaSignOutAlt /> Logout
              </button>

              {/* Mobile Hamburger - Visible until Large Screen (lg:hidden) */}
              <button
                className="lg:hidden focus:outline-none p-2 rounded hover:bg-blue-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE SLIDE-OUT MENU - Shown on screens smaller than Large (lg:hidden) */}
        <div
          className={`fixed inset-y-0 right-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden flex flex-col ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="bg-blue-800 p-4 flex justify-between items-center text-white">
            <span className="font-bold text-lg">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <FaChevronDown className="rotate-90" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Main</div>
            <Link to="/mod-panel" className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
              <FaHome /> Home
            </Link>

            <div className="mt-4 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Instructors</div>
            {instructorGroup.map((item, idx) => (
              <Link key={idx} to={item.path} className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <span className="text-blue-500">{item.icon}</span> {item.label}
              </Link>
            ))}

            <div className="mt-4 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Management</div>
            {managementGroup.map((item, idx) => (
              <Link key={idx} to={item.path} className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                <span className="text-blue-500">{item.icon}</span> {item.label}
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-semibold">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </nav>

      {isLoading && <LoadingOverlay message="Logging Out..." />}
    </>
  );
}