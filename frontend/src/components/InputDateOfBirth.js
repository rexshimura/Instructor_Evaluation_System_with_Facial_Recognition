import React, { useState } from "react";

const InputDateOfBirth = ({ value, onChange }) => {
  // calculate yesterday as the max date
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const maxDate = today.toISOString().split("T")[0];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Date of Birth
      </label>
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        required
        max={maxDate}
      />
    </div>
  );
};

export default InputDateOfBirth;
