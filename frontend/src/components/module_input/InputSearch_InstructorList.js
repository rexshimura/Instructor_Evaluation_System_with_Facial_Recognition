import { useState, useEffect } from "react";

// --- Instructor Search (FIXED VERSION) ---
export const InstructorListSearch = ({ instructors, onSelect }) => {
  const [query, setQuery] = useState("");
  const [filteredInstructors, setFilteredInstructors] = useState([]);

  // Debug: Log the instructors prop to see what's coming from the API
  useEffect(() => {
    console.log("🔍 InstructorListSearch - instructors prop:", instructors);
    console.log("👥 Number of instructors from API:", instructors?.length || 0);
    
    if (instructors && instructors.length > 0) {
      console.log("📋 Sample instructor from API:", instructors[0]);
      console.log("🏷️ Available fields:", Object.keys(instructors[0]));
    }
  }, [instructors]);

  // Filter instructors based on search term
  useEffect(() => {
    if (!instructors || !Array.isArray(instructors)) {
      console.warn("⚠️ No instructors data available");
      setFilteredInstructors([]);
      return;
    }

    if (query.trim() === "") {
      setFilteredInstructors([]);
    } else {
      const searchLower = query.toLowerCase().trim();
      const filtered = instructors.filter((inst) => {
        // Use the actual field names from your API response
        const fullName = `${inst.ins_fname || ''} ${inst.ins_lname || ''}`.toLowerCase();
        const department = (inst.ins_dept || '').toLowerCase();
        const instructorId = (inst.ins_id || '').toString().toLowerCase();
        
        return (
          fullName.includes(searchLower) ||
          department.includes(searchLower) ||
          instructorId.includes(searchLower)
        );
      });
      
      console.log(`🔎 Search "${query}" found ${filtered.length} results`);
      setFilteredInstructors(filtered);
    }
  }, [query, instructors]);

  const handleInstructorSelect = (instructor) => {
    console.log("✅ Selected instructor:", instructor);
    onSelect(instructor);
    setQuery(""); // Clear search after selection
  };

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search instructor by name, department, or ID..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
      
      {/* Debug info */}
      <div className="mt-1 text-xs text-gray-500">
        {instructors ? `${instructors.length} instructors loaded from database` : 'Loading instructors...'}
      </div>

      {query && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-md max-h-60 overflow-y-auto">
          {filteredInstructors.length > 0 ? (
            filteredInstructors.map((inst) => (
              <div
                key={inst.ins_id}
                onClick={() => handleInstructorSelect(inst)}
                className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition duration-150"
              >
                <div className="font-semibold text-gray-800">
                  {inst.ins_fname} {inst.ins_mname ? inst.ins_mname[0] + "." : ""} {inst.ins_lname} {inst.ins_suffix || ''}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>ID:</strong> {inst.ins_id} | <strong>Dept:</strong> {inst.ins_dept}
                </div>
                {inst.ins_email && (
                  <div className="text-xs text-gray-500 mt-1">
                    {inst.ins_email}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 bg-yellow-50">
              {instructors && instructors.length > 0 
                ? `No instructors found matching "${query}"`
                : "No instructors available from database"
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};