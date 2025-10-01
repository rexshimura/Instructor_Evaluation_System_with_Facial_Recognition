import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavBar from "../../../components/module_layout/AdminNavBar";
import CreateModerator from "./create_moderator";
import EditModerator from "./edit_moderator"; // Import the new component

// Data imports
import moderatorsData from "../../../data/moderators";
import logData from "../../../data/list-logs";
import instructorData from "../../../data/list-instructors";
import admins from "../../../data/admin";

import {
  FaUserPlus,
  FaTrash,
  FaSearch,
  FaUserCircle,
  FaIdBadge,
  FaAt,
  FaCalendarAlt,
  FaHistory,
  FaUserTie,
  FaInfoCircle,
  FaRegClock,
  FaFilter,
  FaSpinner,
  FaUserEdit, // Import the edit icon
} from "react-icons/fa";

export default function AdminModeratorList() {
  const [moderators, setModerators] = useState(moderatorsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModerator, setSelectedModerator] = useState(null);

  // State for the new filter dropdown
  const [filterRange, setFilterRange] = useState("all"); // 'all' is the default

  // State for modals and loading
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moderatorToDelete, setModeratorToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // New state for the edit modal
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [moderatorToEdit, setModeratorToEdit] = useState(null);

  const { mod_ID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // This effect syncs the selected moderator with the URL parameter
    if (mod_ID) {
      const mod = moderators.find((m) => m.mod_ID === mod_ID);
      setSelectedModerator(mod || null);
    } else {
      setSelectedModerator(null);
    }
  }, [mod_ID, moderators]);

  const handleSelectModerator = (mod) => {
    navigate(`/adm-moderator-list/${mod.mod_ID}`);
  };

  const filteredModerators = moderators.filter((mod) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${mod.mod_fname} ${mod.mod_lname}`.toLowerCase();
    return (
      fullName.includes(query) ||
      mod.mod_ID.toLowerCase().includes(query) ||
      mod.mod_username.toLowerCase().includes(query)
    );
  });

  const getFullName = (mod) => {
    if (!mod) return "";
    const middleInitial = mod.mod_mname ? ` ${mod.mod_mname}.` : ".";
    return `${mod.mod_lname}, ${mod.mod_fname}${middleInitial}`;
  };

  // --- Logic for Logs & Admins ---
  const moderatorLogs = selectedModerator
    ? logData.filter((log) => log.mod_ID === selectedModerator.mod_ID)
      .sort((a, b) => new Date(b.lg_timestamp) - new Date(a.lg_timestamp))
    : [];

  // REFACTORED: Filtering logic for the activity logs
  const filteredLogs = moderatorLogs.filter(log => {
      if (filterRange === "all") {
        return true; // Show all logs if 'All Time' is selected
      }

      const logDate = new Date(log.lg_timestamp);
      const now = new Date();
      // Set the time to the beginning of the day for accurate date comparisons
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filterRange) {
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          // Check if the log was created on the same day as 'yesterday'
          return (
            logDate.getFullYear() === yesterday.getFullYear() &&
            logDate.getMonth() === yesterday.getMonth() &&
            logDate.getDate() === yesterday.getDate()
          );
        }
        case "last3days": {
          const threeDaysAgo = new Date(today);
          threeDaysAgo.setDate(today.getDate() - 3);
          return logDate >= threeDaysAgo; // Check if log is within the last 3 days
        }
        case "lastWeek": {
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          return logDate >= lastWeek; // Check if log is within the last 7 days
        }
        default:
          return true;
      }
  });


  const getInstructorDetails = (instructorId) => {
    const instructor = instructorData.find(
      (inst) => inst.in_instructorID === instructorId
    );
    if (!instructor) {
        return { id: instructorId, name: "Unknown Instructor", dept: "N/A" };
    }
    const middleInitial = instructor.in_mname ? ` ${instructor.in_mname}.` : ".";
    const name = `${instructor.in_lname}, ${instructor.in_fname}${middleInitial}`;
    return { id: instructor.in_instructorID, name: name, dept: instructor.in_dept };
  };

  const getAdminFullName = (adminId) => {
    const admin = admins.find((adm) => adm.adm_ID === adminId);
    if (!admin) return adminId;
    const middleInitial = admin.adm_mname ? ` ${admin.adm_mname}.` : ".";
    return `${admin.adm_lname}, ${admin.adm_fname}${middleInitial}`;
  };

  // --- Modal and Action Handlers ---

  const handleCreateAccount = () => {
    setCreateModalOpen(true);
  };

  const handleCreateModeratorSubmit = (newModeratorData) => {
    setIsLoading(true);
    setTimeout(() => {
      const newModerator = {
        ...newModeratorData,
        mod_ID: `77${Math.floor(Math.random() * 900) + 100}`, // 3-digit random
        date_created: new Date().toISOString().split('T')[0],
        created_by: "8801", // Assuming a static admin ID for creation
      };
      setModerators(prev => [...prev, newModerator]);
      setIsLoading(false);
      setCreateModalOpen(false);
    }, 1500);
  };

  // New handlers for opening the edit modal and submitting changes
  const handleEditAccount = () => {
    if (selectedModerator) {
      setModeratorToEdit(selectedModerator);
      setEditModalOpen(true);
      // Navigate to the edit URL
      navigate(`/adm-moderator-list/${selectedModerator.mod_ID}/edit`);
    }
  };

  const handleEditModeratorSubmit = (modId, updatedData) => {
    setIsLoading(true);
    setTimeout(() => {
      setModerators(prev =>
        prev.map(mod =>
          mod.mod_ID === modId ? { ...mod, ...updatedData } : mod
        )
      );
      setIsLoading(false);
      setEditModalOpen(false);
      setModeratorToEdit(null);
      // Navigate back to the main view for that moderator
      navigate(`/adm-moderator-list/${modId}`);
    }, 1500);
  };


  const handleDeleteAccount = () => {
    if (selectedModerator) {
      setModeratorToDelete(selectedModerator);
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    setIsLoading(true);
    setTimeout(() => {
      setModerators(prev => prev.filter(mod => mod.mod_ID !== moderatorToDelete.mod_ID));
      setModeratorToDelete(null);
      setDeleteModalOpen(false);
      setIsLoading(false);
      navigate("/adm-moderator-list");
    }, 1500);
  };

  const cancelDelete = () => {
    setModeratorToDelete(null);
    setDeleteModalOpen(false);
  };


  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <AdminNavBar />
      <main className="flex flex-1 overflow-hidden p-8">
        {/* Left Column: Moderator List */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col rounded-l-xl shadow-lg">
          <div className="p-4 border-b space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Moderator Management</h2>
            <div className="relative">
              <FaSearch className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handleCreateAccount}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-150"
            >
              <FaUserPlus /> Create Moderator Account
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filteredModerators.map((mod) => (
              <li key={mod.mod_ID}>
                <button
                  onClick={() => handleSelectModerator(mod)}
                  className={`w-full text-left p-4 border-b hover:bg-purple-50 transition ${
                    selectedModerator?.mod_ID === mod.mod_ID
                      ? "bg-purple-100 border-l-4 border-purple-600"
                      : "border-transparent"
                  }`}
                >
                  <p className="font-semibold text-gray-800">{getFullName(mod)}</p>
                  <p className="text-sm text-gray-500">{mod.mod_ID}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Details Panel */}
        <div className="w-2/3">
          {selectedModerator ? (
            <div className="bg-white p-6 rounded-r-xl shadow-lg animate-fade-in h-full flex flex-col">
              {/* Profile Header and Details */}
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <FaUserCircle className="text-6xl text-purple-600" />
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900">{getFullName(selectedModerator)}</h3>
                      <p className="text-md text-gray-500">{selectedModerator.mod_ID}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handleEditAccount} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150">
                        <FaUserEdit /> Edit Account
                    </button>
                    <button onClick={handleDeleteAccount} className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-150">
                      <FaTrash /> Delete Account
                    </button>
                  </div>
                </div>
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-3"><FaAt className="text-gray-400" /><span className="font-semibold text-gray-700">Username:</span><span className="text-gray-900">{selectedModerator.mod_username}</span></div>
                  <div className="flex items-center gap-3"><FaCalendarAlt className="text-gray-400" /><span className="font-semibold text-gray-700">Date Created:</span><span className="text-gray-900">{selectedModerator.date_created}</span></div>
                  <div className="flex items-center gap-3"><FaIdBadge className="text-gray-400" /><span className="font-semibold text-gray-700">Created By:</span><span className="text-gray-900">{getAdminFullName(selectedModerator.created_by)}</span></div>
                </div>
              </div>

              {/* Activity Logs Section */}
              <div className="mt-8 border-t pt-6 flex flex-col flex-grow min-h-0">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3"><FaHistory className="text-purple-600" />Activity Logs</h4>
                    {/* REFACTORED: Filter UI changed to a dropdown select */}
                    <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-500" />
                        <select
                            value={filterRange}
                            onChange={(e) => setFilterRange(e.target.value)}
                            className="p-2 border rounded-md shadow-sm text-sm bg-white focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="all">All Time</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last3days">Last 3 Days</option>
                            <option value="lastWeek">Last Week</option>
                        </select>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                  {filteredLogs.length > 0 ? (
                    <ul className="space-y-4">
                      {filteredLogs.map((log) => {
                        const instructor = getInstructorDetails(log.in_id);
                        const logDate = new Date(log.lg_timestamp);
                        return (
                          <li key={log.lg_id} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-bold text-purple-700 text-md">{log.lg_action}</p>
                                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                                        <p className="flex items-center gap-2"><FaUserTie className="text-gray-400"/><span>{instructor.name}</span></p>
                                        <p className="flex items-center gap-2"><FaInfoCircle className="text-gray-400"/><span>{instructor.id} &middot; <span className="font-semibold">{instructor.dept}</span></span></p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 text-right flex flex-col items-end gap-1">
                                    <span className="font-semibold">{logDate.toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><FaRegClock />{logDate.toLocaleTimeString()}</span>
                                </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center text-gray-500">
                        <div>
                            <FaFilter className="text-4xl text-gray-300 mx-auto mb-2"/>
                            <p>No activity logs found for the selected filter.</p>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center bg-white rounded-r-xl shadow-lg">
              <div>
                <FaUserCircle className="text-8xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600">Select a moderator from the list</h3>
                <p className="text-gray-400 mt-1">Their details will be displayed here.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Moderator Modal */}
      <CreateModerator
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateModeratorSubmit}
        isLoading={isLoading}
      />

      {/* Edit Moderator Modal */}
      <EditModerator
        isOpen={isEditModalOpen}
        onClose={() => {
            setEditModalOpen(false);
            // Navigate back if the user closes the modal without saving
            if (selectedModerator) {
                navigate(`/adm-moderator-list/${selectedModerator.mod_ID}`);
            }
        }}
        onSubmit={handleEditModeratorSubmit}
        isLoading={isLoading}
        moderatorData={moderatorToEdit}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
             <h3 className="text-lg font-bold text-gray-800">Confirm Deletion</h3>
             <p className="mt-2 text-sm text-gray-600">
               Are you sure you want to delete the account for <span className="font-semibold">{getFullName(moderatorToDelete)}</span>? This action cannot be undone.
             </p>
             <div className="mt-6 flex justify-end gap-3">
               <button onClick={cancelDelete} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                 Cancel
               </button>
               <button onClick={confirmDelete} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 disabled:bg-red-400">
                 {isLoading && <FaSpinner className="animate-spin" />}
                 Confirm
               </button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}