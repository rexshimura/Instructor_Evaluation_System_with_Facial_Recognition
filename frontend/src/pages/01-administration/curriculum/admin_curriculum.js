import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch, FiRefreshCw } from "react-icons/fi";
import axios from "axios";

// Component and Data Imports
import AdminNavBar from "../../../components/module_layout/AdminNavBar";
import EditSubjectModal from "./admin_editsubject";
import AddSubjectModal from "./admin_addsubject";
import Toast from "../../../components/module_feedback/ToastNotification";

const API_BASE = "http://localhost:5000";

export default function AdminCurriculum() {
  const [subjects, setSubjects] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [filters, setFilters] = useState({ 
    course: "All", 
    prefix: "All", 
    year: "All", 
    semester: "All", 
    units: "All" 
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const { subjectId } = useParams();

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showToast("Failed to load subjects", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Effect to synchronize the modal's visibility with the URL.
  useEffect(() => {
    if (subjectId) {
      const subject = subjects.find(s => s.sub_id === parseInt(subjectId));
      if (subject) {
        setSubjectToEdit(subject);
        setIsEditModalOpen(true);
      } else {
        showToast("Subject not found.", "error");
        navigate("/adm-curriculum");
      }
    } else {
      setIsEditModalOpen(false);
      setSubjectToEdit(null);
    }
  }, [subjectId, subjects, navigate]);

  // Extract unique course prefixes based on selected course
  const coursePrefixes = useMemo(() => {
    if (filters.course === "All") return [];
    const prefixes = subjects
      .filter(s => s.sub_course === filters.course)
      .map(s => s.sub_miscode?.replace(/[0-9]/g, '') || '')
      .filter(prefix => prefix && prefix.trim() !== '');
    return [...new Set(prefixes)].sort();
  }, [filters.course, subjects]);

  // Extract unique units from subjects
  const availableUnits = useMemo(() => {
    const units = subjects
      .map(s => s.sub_units)
      .filter(unit => unit !== null && unit !== undefined)
      .map(unit => parseInt(unit));
    return [...new Set(units)].sort((a, b) => a - b);
  }, [subjects]);

  // Filter subjects based on search query and filters
  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const miscodePrefix = s.sub_miscode?.replace(/[0-9]/g, '') || '';
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch = searchQuery === "" || 
        s.sub_name.toLowerCase().includes(searchLower) ||
        s.sub_miscode?.toLowerCase().includes(searchLower);

      return (
        matchesSearch &&
        (filters.course === "All" || s.sub_course === filters.course) &&
        (filters.prefix === "All" || miscodePrefix === filters.prefix) &&
        (filters.year === "All" || s.sub_year.toString() === filters.year) &&
        (filters.semester === "All" || s.sub_semester.toString() === filters.semester) &&
        (filters.units === "All" || (s.sub_units && s.sub_units.toString() === filters.units))
      );
    });
  }, [subjects, filters, searchQuery]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: value,
      // Reset prefix filter when course changes
      ...(name === 'course' && { prefix: 'All' }) 
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      course: "All",
      prefix: "All", 
      year: "All",
      semester: "All",
      units: "All"
    });
    setSearchQuery("");
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubjects();
  };

  // Open edit modal
  const handleOpenEditModal = (subject) => {
    navigate(`/adm-curriculum/${subject.sub_id}/edit`);
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    navigate('/adm-curriculum');
  };

  // Add new subject
  const handleAddSubject = async (newSubject) => {
    try {
      const response = await axios.post(`${API_BASE}/subjects`, newSubject);
      setSubjects(prevSubjects => [...prevSubjects, response.data.subject]);
      setIsAddModalOpen(false);
      showToast("A new subject has been added successfully!");
    } catch (error) {
      console.error("Error adding subject:", error);
      
      // Handle specific backend validation errors
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || "Failed to add subject";
        showToast(errorMessage, "error");
      } else {
        showToast("Failed to add subject", "error");
      }
      
      // Re-throw the error so the AddSubjectModal can handle it too
      throw error;
    }
  };

  // Update existing subject
  const handleUpdateSubject = async (updatedSubject) => {
    try {
      const response = await axios.put(`${API_BASE}/subjects/${updatedSubject.sub_id}`, updatedSubject);
      setSubjects(subjects.map(s => s.sub_id === updatedSubject.sub_id ? response.data.updated : s));
      handleCloseEditModal();
      showToast("Subject updated successfully!");
    } catch (error) {
      console.error("Error updating subject:", error);
      
      // Handle specific backend validation errors
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || "Failed to update subject";
        showToast(errorMessage, "error");
      } else if (error.response?.status === 404) {
        showToast("Subject not found", "error");
      } else {
        showToast("Failed to update subject", "error");
      }
      
      // Re-throw the error so the EditSubjectModal can handle it too
      throw error;
    }
  };

  // Delete subject
  const handleDeleteSubject = async (subjectId, subjectName) => {
    if (window.confirm(`Are you sure you want to permanently delete "${subjectName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${API_BASE}/subjects/${subjectId}`);
        setSubjects(subjects.filter(s => s.sub_id !== subjectId));
        showToast(`Subject "${subjectName}" was deleted.`, 'error');
      } catch (error) {
        console.error("Error deleting subject:", error);
        
        // Handle specific backend errors
        if (error.response?.status === 404) {
          showToast("Subject not found", "error");
        } else if (error.response?.status === 500) {
          showToast("Cannot delete subject - it may be referenced by other records", "error");
        } else {
          showToast("Failed to delete subject", "error");
        }
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading subjects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavBar />
      
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <main className="flex-1 flex flex-col p-4 md:p-8 gap-6 overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Curriculum Management</h1>
            <p className="text-gray-500 mt-1">Manage, filter, and organize all subjects.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-150 disabled:opacity-50"
              title="Refresh"
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)} 
              className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-150 shadow-md"
            >
              <FiPlus size={18} />
              <span>Add New Subject</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Card */}
        <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center">
              <FiFilter className="text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">Filter & Search</h3>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Name or MIS Code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                />
              </div>
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150"
              >
                Clear
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select 
                name="course" 
                value={filters.course} 
                onChange={handleFilterChange} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="All">All Courses</option>
                <option value="BSIT">BSIT</option>
                <option value="BSIS">BSIS</option>
                <option value="BSCS">BSCS</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
              <select 
                name="prefix" 
                value={filters.prefix} 
                onChange={handleFilterChange} 
                disabled={filters.course === "All"} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="All">All Prefixes</option>
                {coursePrefixes.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select 
                name="year" 
                value={filters.year} 
                onChange={handleFilterChange} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="All">All Years</option>
                {[1, 2, 3, 4].map(y => (
                  <option key={y} value={y}>{y} Year</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <select 
                name="semester" 
                value={filters.semester} 
                onChange={handleFilterChange} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="All">All Semesters</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
              <select 
                name="units" 
                value={filters.units} 
                onChange={handleFilterChange} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="All">All Units</option>
                {availableUnits.map(u => (
                  <option key={u} value={u}>{u} Unit{u !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subjects Table */}
        <div className="flex-1 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {["ID", "MIS Code", "Subject Name", "Course", "Year", "Sem", "Units", "Actions"].map(header => (
                    <th 
                      key={header} 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <tr key={subject.sub_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                        {subject.sub_id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-800">
                        {subject.sub_miscode || 'N/A'}
                      </td>
                      <td 
                        className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate" 
                        title={subject.sub_name}
                      >
                        {subject.sub_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          subject.sub_course === 'BSIT' 
                            ? 'bg-blue-100 text-blue-800' 
                            : subject.sub_course === 'BSIS'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {subject.sub_course}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {subject.sub_year}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                        {subject.sub_semester}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 font-medium">
                        {subject.sub_units || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenEditModal(subject)} 
                            className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors" 
                            title="Edit Subject"
                          >
                            <FiEdit size={16}/>
                          </button>
                          <button 
                            onClick={() => handleDeleteSubject(subject.sub_id, subject.sub_name)} 
                            className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" 
                            title="Delete Subject"
                          >
                            <FiTrash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-16 text-gray-500">
                      <div className="flex flex-col items-center">
                        <FiSearch size={48} className="text-gray-300 mb-2" />
                        <p className="text-lg font-medium mb-1">No subjects found</p>
                        <p className="text-sm">
                          {searchQuery || Object.values(filters).some(f => f !== "All") 
                            ? "Try adjusting your search or filters" 
                            : "No subjects available in the system"
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          {filteredSubjects.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredSubjects.length}</span> of{' '}
                <span className="font-semibold">{subjects.length}</span> subjects
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddSubjectModal 
        show={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddSubject} 
      />
      
      {subjectToEdit && (
        <EditSubjectModal 
          show={isEditModalOpen} 
          onClose={handleCloseEditModal} 
          subject={subjectToEdit} 
          onSave={handleUpdateSubject} 
        />
      )}

      {/* Footer */}
      <footer className="bg-white text-center py-4 border-t border-gray-200 mt-auto">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)
        </p>
      </footer>
    </div>
  );
}