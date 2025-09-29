import {useState} from "react";
import instructorData from "../../data/list-instructors";

// --- Instructor Search (no changes) ---
export const InstructorListSearch = ({ onSelect, navigate }) => {
  const [query, setQuery] = useState("");
  const filtered = instructorData.filter((inst) => {
    const fullName = `${inst.in_fname} ${inst.in_lname}`.toLowerCase();
    return (
      fullName.includes(query.toLowerCase()) ||
      inst.in_dept.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search instructor by name or department..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
      />
      {query && (
        <div className="mt-2 bg-white border rounded-lg shadow-md max-h-60 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((inst) => (
              <div
                key={inst.in_instructorID}
                onClick={() => {
                  onSelect(inst);
                  navigate(`/mod-record-face/${inst.in_instructorID}`);
                }}
                className="p-2 hover:bg-blue-100 cursor-pointer"
              >
                {inst.in_fname} {inst.in_mname ? inst.in_mname[0] + "." : ""}{" "}
                {inst.in_lname} {inst.in_suffix} -{" "}
                <span className="text-sm text-gray-500">{inst.in_dept}</span>
              </div>
            ))
          ) : (
            <p className="p-2 text-gray-500">No instructors found</p>
          )}
        </div>
      )}
    </div>
  );
};