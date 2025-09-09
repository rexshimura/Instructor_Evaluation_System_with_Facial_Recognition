import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingOverlay from "../module_feedback/LoadingOverlay"; // Assuming the file path is correct

export default function StudentNavBar() {
  const [isLoading, setIsLoading] = useState(false);
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
      <nav className="bg-blue-600 text-white p-4 flex justify-between">
        <h1 className="font-bold text-lg">Student Portal</h1>
        <ul className="flex gap-6 relative items-center">
          <li className="hover:underline cursor-pointer">
            <Link to="/home">Home</Link>
          </li>
          <li className="hover:underline cursor-pointer">
            <Link to="/evaluate">Evaluate</Link>
          </li>
          <li className="hover:underline cursor-pointer" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </nav>

      {/* Conditionally render the loading overlay */}
      {isLoading && <LoadingOverlay message="Logging Out" />}
    </>
  );
}