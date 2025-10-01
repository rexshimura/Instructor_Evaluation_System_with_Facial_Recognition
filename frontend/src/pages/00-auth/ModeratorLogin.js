import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../../components/module_feedback/LoadingOverlay";
import InputText from "../../components/module_input/InputText";
import InputPassword from "../../components/module_input/InputPassword";
import { FaArrowLeft, FaUserGraduate, FaUserCog } from "react-icons/fa";

export default function ModeratorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("/moderator_login", { username, password });

      sessionStorage.setItem("user", JSON.stringify(res.data.moderator));
      sessionStorage.setItem("role", "moderator");
      navigate("/mod-panel");
    } catch (err) {
      setMessage("❌ Invalid username or password.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Image with Text Overlay */}
        <div
          className="hidden md:block bg-cover bg-center relative"
          style={{ backgroundImage: "url('/png/banner/banner-04.png')" }}
        >
          <div className="absolute bottom-0 left-0 w-full p-4 bg-black/50 text-white text-xs">
            <p>Image Taken from Cebu Technological University - Main</p>
            <p>Captured by: JP Mahilom</p>
            <p>Made By RavenLabs Development Group, all rights reserved</p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-white flex flex-col justify-center items-center p-8 relative">
          <button
            onClick={() => navigate("/")}
            className="absolute top-8 right-8 flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
          >
            <FaArrowLeft />
            <span>Return</span>
          </button>

          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold mb-2">
              Pro<span className="text-blue-400">Ev</span>
            </h1>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Moderator Login
            </h2>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <InputText
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  type="text"
                />
                <InputPassword
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-grow bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  disabled={isLoading}
                >
                  Login
                </button>
                {/* Student Login Icon */}
                <div className="relative group">
                  <Link
                    to="/stud-login"
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition"
                  >
                    <FaUserGraduate size={20} />
                  </Link>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Login as Student
                  </span>
                </div>
                {/* Admin Login Icon */}
                <div className="relative group">
                  <Link
                    to="/admn-login"
                    className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition"
                  >
                    <FaUserCog size={20} />
                  </Link>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Login as Admin
                  </span>
                </div>
              </div>

              {message && (
                <p className="mt-4 text-center text-red-500">{message}</p>
              )}
            </form>
          </div>
        </div>
      </div>
      {isLoading && <LoadingOverlay message="Logging in as Moderator" />}
    </>
  );
}
