import React, { useState } from "react";

const InputPassword = ({ label, value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
};

export default InputPassword;
