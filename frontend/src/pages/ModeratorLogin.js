import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import moderators from "../data/moderators";
import LoadingOverlay from "../components/module_feedback/LoadingOverlay";
import InputText from "../components/module_input/InputText";
import InputPassword from "../components/module_input/InputPassword";

export default function ModeratorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const foundModerator = moderators.find(
        (mod) => mod.mod_username === username && mod.mod_password === password
      );

      if (foundModerator) {
        sessionStorage.setItem("user", JSON.stringify(foundModerator));
        sessionStorage.setItem("role", "moderator");
        navigate("/mod-panel");
      } else {
        setMessage("❌ Invalid username or password.");
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 rounded-xl shadow-lg w-96"
        >
          <h2 className="text-2xl font-bold mb-4">Moderator Login</h2>
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
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-4"
            disabled={isLoading}
          >
            Login
          </button>
          {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        </form>
        <button
          onClick={() => navigate("/")}
          className="absolute bottom-10 text-blue-500 hover:underline"
        >
          Login as Student
        </button>
      </div>
      {isLoading && <LoadingOverlay message="Logging in as Moderator" />}
    </>
  );
}