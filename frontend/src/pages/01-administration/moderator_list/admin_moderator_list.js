import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavBar from "../../../components/module_layout/AdminNavBar";
import CreateModerator from "./create_moderator";
import EditModerator from "./edit_moderator";

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
  FaUserEdit,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function AdminModeratorList() {
  const [moderators, setModerators] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModerator, setSelectedModerator] = useState(null);

  // State for the new filter dropdown
  const [filterRange, setFilterRange] = useState("all");

  // State for modals and loading
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moderatorToDelete, setModeratorToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // New state for the edit modal
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [moderatorToEdit, setModeratorToEdit] = useState(null);

  // State for dynamic data
  const [instructors, setInstructors] = useState([]);
  const [logs, setLogs] = useState([]);

  const { mod_ID } = useParams();
  const navigate = useNavigate();

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch moderators
        const moderatorsRes = await fetch("/moderators");
        if (!moderatorsRes.ok) {
          throw new Error(`Failed to fetch moderators: ${moderatorsRes.status}`);
        }
        const moderatorsData = await moderatorsRes.json();
        
        if (moderatorsData.error) throw new Error(moderatorsData.error);
        setModerators(moderatorsData);

        // Fetch instructors for log details
        const instructorsRes = await fetch("/instructors");
        if (!instructorsRes.ok) {
          throw new Error(`Failed to fetch instructors: ${instructorsRes.status}`);
        }
        const instructorsData = await instructorsRes.json();
        
        if (instructorsData.error) throw new Error(instructorsData.error);
        setInstructors(instructorsData);

        // Fetch logs with better error handling
        try {
          const logsRes = await fetch("/logs");
          if (!logsRes.ok) {
            // If logs endpoint fails, set empty array and continue
            console.warn("Logs endpoint returned error:", logsRes.status);
            setLogs([]);
            return;
          }
          const logsData = await logsRes.json();
          
          // Ensure logs is always an array
          if (Array.isArray(logsData)) {
            setLogs(logsData);
          } else if (logsData && logsData.error) {
            console.warn("Logs API returned error:", logsData.error);
            setLogs([]);
          } else {
            setLogs([]);
          }
        } catch (logError) {
          console.warn("Could not fetch logs:", logError);
          setLogs([]); // Set to empty array instead of undefined
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh data when modals close
  useEffect(() => {
    if (!isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen) {
      const refreshData = async () => {
        try {
          const moderatorsRes = await fetch("/moderators");
          if (moderatorsRes.ok) {
            const moderatorsData = await moderatorsRes.json();
            if (!moderatorsData.error) {
              setModerators(moderatorsData);
            }
          }
        } catch (err) {
          console.error("Error refreshing data:", err);
        }
      };
      refreshData();
    }
  }, [isCreateModalOpen, isEditModalOpen, isDeleteModalOpen]);

  useEffect(() => {
    // This effect syncs the selected moderator with the URL parameter
    if (mod_ID && moderators.length > 0) {
      const mod = moderators.find((m) => m.mod_id.toString() === mod_ID);
      setSelectedModerator(mod || null);
    } else {
      setSelectedModerator(null);
    }
  }, [mod_ID, moderators]);

  const handleSelectModerator = (mod) => {
    navigate(`/adm-moderator-list/${mod.mod_id}`);
  };

  const filteredModerators = moderators.filter((mod) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${mod.mod_fname} ${mod.mod_lname}`.toLowerCase();
    return (
      fullName.includes(query) ||
      mod.mod_id.toString().includes(query) ||
      mod.mod_username.toLowerCase().includes(query)
    );
  });

  const getFullName = (mod) => {
    if (!mod) return "";
    const middleInitial = mod.mod_mname ? ` ${mod.mod_mname.charAt(0)}.` : "";
    return `${mod.mod_lname}, ${mod.mod_fname}${middleInitial}`;
  };

  // --- Logic for Logs & Admins ---
  const moderatorLogs = selectedModerator && Array.isArray(logs)
    ? logs.filter((log) => log.mod_id === selectedModerator.mod_id)
        .sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
    : [];

  // REFACTORED: Filtering logic for the activity logs
  const filteredLogs = moderatorLogs.filter(log => {
      if (filterRange === "all") {
        return true;
      }

      const logDate = new Date(log.log_date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filterRange) {
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return (
            logDate.getFullYear() === yesterday.getFullYear() &&
            logDate.getMonth() === yesterday.getMonth() &&
            logDate.getDate() === yesterday.getDate()
          );
        }
        case "last3days": {
          const threeDaysAgo = new Date(today);
          threeDaysAgo.setDate(today.getDate() - 3);
          return logDate >= threeDaysAgo;
        }
        case "lastWeek": {
          const lastWeek = new Date(today);
          lastWeek.setDate(today.getDate() - 7);
          return logDate >= lastWeek;
        }
        default:
          return true;
      }
  });

  const getInstructorDetails = (instructorId) => {
    if (!instructorId) {
      return { id: "N/A", name: "No Instructor", dept: "N/A" };
    }
    
    const instructor = instructors.find(
      (inst) => inst.ins_id === instructorId
    );
    if (!instructor) {
        return { id: instructorId, name: "Unknown Instructor", dept: "N/A" };
    }
    const middleInitial = instructor.ins_mname ? ` ${instructor.ins_mname.charAt(0)}.` : "";
    const suffix = instructor.ins_suffix ? ` ${instructor.ins_suffix}` : "";
    const name = `${instructor.ins_lname}, ${instructor.ins_fname}${middleInitial}${suffix}`;
    return { id: instructor.ins_id, name: name, dept: instructor.ins_dept };
  };

  // Since we don't have admin data, we'll use the created_by field as is
  const getAdminFullName = (adminId) => {
    return adminId || "System";
  };

  // --- Modal and Action Handlers ---

  const handleCreateAccount = () => {
    setCreateModalOpen(true);
  };

  const handleCreateModeratorSubmit = async (newModeratorData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/moderators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newModeratorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create moderator");
      }

      const result = await response.json();

      // Refresh moderators list
      const moderatorsRes = await fetch("/moderators");
      if (!moderatorsRes.ok) {
        throw new Error("Failed to refresh moderators list");
      }
      const moderatorsData = await moderatorsRes.json();
      
      if (moderatorsData.error) throw new Error(moderatorsData.error);
      
      setModerators(moderatorsData);
      setCreateModalOpen(false);
      
      // Select the newly created moderator
      if (result.moderator) {
        navigate(`/adm-moderator-list/${result.moderator.mod_id}`);
      }
      
    } catch (err) {
      console.error("Error creating moderator:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAccount = () => {
    if (selectedModerator) {
      setModeratorToEdit(selectedModerator);
      setEditModalOpen(true);
    }
  };

  const handleEditModeratorSubmit = async (modId, updatedData) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/moderators/${modId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update moderator");
      }

      const result = await response.json();

      // Refresh moderators list
      const moderatorsRes = await fetch("/moderators");
      if (!moderatorsRes.ok) {
        throw new Error("Failed to refresh moderators list");
      }
      const moderatorsData = await moderatorsRes.json();
      
      if (moderatorsData.error) throw new Error(moderatorsData.error);
      
      setModerators(moderatorsData);
      setEditModalOpen(false);
      setModeratorToEdit(null);
      
      // Update selected moderator if it's the one being edited
      if (selectedModerator && selectedModerator.mod_id === modId) {
        const updatedModerator = moderatorsData.find(m => m.mod_id === modId);
        if (updatedModerator) {
          setSelectedModerator(updatedModerator);
        }
      }
      
    } catch (err) {
      console.error("Error updating moderator:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (selectedModerator) {
      setModeratorToDelete(selectedModerator);
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/moderators/${moderatorToDelete.mod_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete moderator");
      }

      const result = await response.json();

      // Refresh moderators list
      const moderatorsRes = await fetch("/moderators");
      if (!moderatorsRes.ok) {
        throw new Error("Failed to refresh moderators list");
      }
      const moderatorsData = await moderatorsRes.json();
      
      if (moderatorsData.error) throw new Error(moderatorsData.error);
      
      setModerators(moderatorsData);
      setModeratorToDelete(null);
      setDeleteModalOpen(false);
      navigate("/adm-moderator-list");
      
    } catch (err) {
      console.error("Error deleting moderator:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setModeratorToDelete(null);
    setDeleteModalOpen(false);
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (isLoading && moderators.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <AdminNavBar />
        <main className="flex flex-1 overflow-hidden p-8 items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading moderators...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && moderators.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <AdminNavBar />
        <main className="flex flex-1 overflow-hidden p-8 items-center justify-center">
          <div className="text-center text-red-600">
            <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <AdminNavBar />
      
      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      
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
              <li key={mod.mod_id}>
                <button
                  onClick={() => handleSelectModerator(mod)}
                  className={`w-full text-left p-4 border-b hover:bg-purple-50 transition ${
                    selectedModerator?.mod_id === mod.mod_id
                      ? "bg-purple-100 border-l-4 border-purple-600"
                      : "border-transparent"
                  }`}
                >
                  <p className="font-semibold text-gray-800">{getFullName(mod)}</p>
                  <p className="text-sm text-gray-500">ID: {mod.mod_id}</p>
                  <p className="text-xs text-gray-400">@{mod.mod_username}</p>
                </button>
              </li>
            ))}
            {filteredModerators.length === 0 && (
              <li className="p-4 text-center text-gray-500">
                {searchQuery ? "No moderators found matching your search" : "No moderators found"}
              </li>
            )}
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
                      <p className="text-md text-gray-500">ID: {selectedModerator.mod_id}</p>
                      <p className="text-sm text-gray-400">@{selectedModerator.mod_username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleEditAccount} 
                      className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-150"
                    >
                      <FaUserEdit /> Edit Account
                    </button>
                    <button 
                      onClick={handleDeleteAccount} 
                      className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-150"
                    >
                      <FaTrash /> Delete Account
                    </button>
                  </div>
                </div>
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-3">
                    <FaAt className="text-gray-400" />
                    <span className="font-semibold text-gray-700">Username:</span>
                    <span className="text-gray-900">{selectedModerator.mod_username}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-gray-400" />
                    <span className="font-semibold text-gray-700">Date Created:</span>
                    <span className="text-gray-900">
                      {new Date(selectedModerator.date_created).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaIdBadge className="text-gray-400" />
                    <span className="font-semibold text-gray-700">Created By:</span>
                    <span className="text-gray-900">{getAdminFullName(selectedModerator.created_by)}</span>
                  </div>
                </div>
              </div>

              {/* Activity Logs Section */}
              <div className="mt-8 border-t pt-6 flex flex-col flex-grow min-h-0">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <FaHistory className="text-purple-600" />
                    Activity Logs ({moderatorLogs.length})
                  </h4>
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
                        const instructor = getInstructorDetails(log.ins_id);
                        const logDate = new Date(log.log_date);
                        return (
                          <li key={log.log_id} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-bold text-purple-700 text-md">{log.log_action}</p>
                                <div className="mt-2 text-sm text-gray-600 space-y-1">
                                  <p className="flex items-center gap-2">
                                    <FaUserTie className="text-gray-400"/>
                                    <span>{instructor.name}</span>
                                  </p>
                                  <p className="flex items-center gap-2">
                                    <FaInfoCircle className="text-gray-400"/>
                                    <span>{instructor.id} &middot; <span className="font-semibold">{instructor.dept}</span></span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 text-right flex flex-col items-end gap-1">
                                <span className="font-semibold">
                                  {logDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaRegClock />
                                  {logDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
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
                        {moderatorLogs.length > 0 && (
                          <p className="text-sm mt-1">
                            {moderatorLogs.length} logs available for other time periods
                          </p>
                        )}
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
          setModeratorToEdit(null);
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
              <button 
                onClick={cancelDelete} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isLoading} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 disabled:bg-red-400"
              >
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