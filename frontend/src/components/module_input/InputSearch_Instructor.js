// src/components/InputSearch.js
import React, { useState } from "react";
import instructors from "../../data/instructors";

const InputSearch = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    const filtered = instructors.filter(
      (ins) =>
        ins.fname.toLowerCase().includes(value.toLowerCase()) ||
        ins.lname.toLowerCase().includes(value.toLowerCase()) ||
        ins.department.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filtered);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0) handleSelect(suggestions[highlightIndex]);
      else if (suggestions.length === 1) handleSelect(suggestions[0]);
    }
  };

  const handleSelect = (ins) => {
    setQuery(`${ins.fname} ${ins.lname} (${ins.department})`);
    setSuggestions([]);
    if (onSelect) onSelect(ins);
  };

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search instructor..."
        className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
          {suggestions.map((ins, index) => (
            <li
              key={ins.instructorID}
              onClick={() => handleSelect(ins)}
              className={`px-4 py-2 cursor-pointer ${
                index === highlightIndex ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <span className="font-medium">
                {ins.fname} {ins.lname}
              </span>{" "}
              <span className="text-sm text-gray-500">
                ({ins.department})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InputSearch;
