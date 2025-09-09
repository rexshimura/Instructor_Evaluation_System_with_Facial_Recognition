import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingOverlay from "../module_feedback/LoadingOverlay";

export default function ModeratorNavBar() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoading(true);

    setTimeout(() => {
      sessionStorage.removeItem("moderator");
      navigate("/mod");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <nav className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Moderator Portal</h1>
        <ul className="flex gap-6 items-center">
          <li className="hover:underline cursor-pointer">
            <Link to="/mod-panel">Home</Link>
          </li>
          <li className="hover:underline cursor-pointer">
            <Link to="/">Instructor List</Link>
          </li>
          <li className="hover:underline cursor-pointer">
            <Link to="/">Facial Registry</Link>
          </li>
          <li className="hover:underline cursor-pointer" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </nav>
      {isLoading && <LoadingOverlay message="Logging Out" />}
    </>
  );
}