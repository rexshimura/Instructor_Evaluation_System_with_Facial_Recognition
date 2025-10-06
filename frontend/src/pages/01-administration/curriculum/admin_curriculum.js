import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch } from "react-icons/fi";
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
  const [filters, setFilters] = useState({ course: "All", prefix: "All", year: "All", semester: "All", units: "All" });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { subjectId } = useParams();

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/subject_list`);
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      showToast("Failed to load subjects", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Effect to synchronize the modal's visibility with the URL.
  useEffect(() => {
    if (subjectId) {
      const subject = subjects.find(s => s.sb_subid === parseInt(subjectId));
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

  const coursePrefixes = useMemo(() => {
    if (filters.course === "All") return [];
    const prefixes = subjects
      .filter(s => s.sb_course === filters.course)
      .map(s => s.sb_miscode.replace(/[0-9]/g, ''));
    return [...new Set(prefixes)];
  }, [filters.course, subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s => {
      const miscodePrefix = s.sb_miscode.replace(/[0-9]/g, '');
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch = s.sb_name.toLowerCase().includes(searchLower) ||
                            s.sb_miscode.toLowerCase().includes(searchLower);

      return (
        matchesSearch &&
        (filters.course === "All" || s.sb_course === filters.course) &&
        (filters.prefix === "All" || miscodePrefix === filters.prefix) &&
        (filters.year === "All" || s.sb_year.toString() === filters.year) &&
        (filters.semester === "All" || s.sb_semester.toString() === filters.semester) &&
        (filters.units === "All" || (s.sb_units && s.sb_units.toString() === filters.units))
      );
    });
  }, [subjects, filters, searchQuery]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, ...(name === 'course' && { prefix: 'All' }) }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleOpenEditModal = (subject) => {
    navigate(`/adm-curriculum/${subject.sb_subid}/edit`);
  };

  const handleCloseEditModal = () => {
    navigate('/adm-curriculum');
  };

  const handleAddSubject = async (newSubject) => {
    try {
      const response = await axios.post(`${API_BASE}/subject_list`, newSubject);
      setSubjects(prevSubjects => [...prevSubjects, response.data]);
      setIsAddModalOpen(false);
      showToast("A new subject has been added successfully!");
    } catch (error) {
      console.error("Error adding subject:", error);
      
      // Handle specific backend validation errors
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || "Subject with this MIS code already exists";
        showToast(errorMessage, "error");
      } else {
        showToast("Failed to add subject", "error");
      }
      
      // Re-throw the error so the AddSubjectModal can handle it too
      throw error;
    }
  };

  const handleUpdateSubject = async (updatedSubject) => {
    try {
      const response = await axios.put(`${API_BASE}/subject_list/${updatedSubject.sb_subid}`, updatedSubject);
      setSubjects(subjects.map(s => s.sb_subid === updatedSubject.sb_subid ? response.data : s));
      handleCloseEditModal();
      showToast("Subject updated successfully!");
    } catch (error) {
      console.error("Error updating subject:", error);
      
      // Handle specific backend validation errors
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.error || "Subject with this MIS code already exists";
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

  const handleDeleteSubject = async (subjectId, subjectName) => {
    if (window.confirm(`Are you sure you want to permanently delete "${subjectName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${API_BASE}/subject_list/${subjectId}`);
        setSubjects(subjects.filter(s => s.sb_subid !== subjectId));
        showToast(`Subject "${subjectName}" was deleted.`, 'error');
      } catch (error) {
        console.error("Error deleting subject:", error);
        
        // Handle specific backend errors
        if (error.response?.status === 404) {
          showToast("Subject not found", "error");
        } else {
          showToast("Failed to delete subject", "error");
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
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
    <div className="h-screen bg-gray-50 flex flex-col">
      <AdminNavBar />
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}

      <main className="flex-1 flex flex-col p-4 md:p-8 gap-6 overflow-hidden">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Curriculum Management</h1>
            <p className="text-gray-500">Manage, filter, and organize all subjects.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-150 shadow-md"
          >
            <FiPlus /> Add New Subject
          </button>
        </div>

        {/* Filter & Search Card */}
        <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                  <FiFilter className="text-gray-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-700">Filter & Search</h3>
              </div>
              <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                      type="text"
                      placeholder="Search Name or MIS Code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-64"
                  />
              </div>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Course</label>
                    <select name="course" value={filters.course} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="All">All Courses</option>
                        <option value="BSIT">BSIT</option>
                        <option value="BSIS">BSIS</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prefix</label>
                    <select name="prefix" value={filters.prefix} onChange={handleFilterChange} disabled={filters.course === "All"} className="mt-1 block w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100">
                        <option value="All">All Prefixes</option>
                        {coursePrefixes.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <select name="year" value={filters.year} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                        <option value="All">All Years</option>
                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Semester</label>
                    <select name="semester" value={filters.semester} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                        <option value="All">All Semesters</option>
                        {[1, 2].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Units</label>
                    <select name="units" value={filters.units} onChange={handleFilterChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                        <option value="All">All Units</option>
                        {[1, 2, 3, 6].map(u => <option key={u} value={u}>{u}</option>)}
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
                    {["MIS Code", "Subject Name", "Course", "Year", "Sem", "Units", ""].map(header =>
                      <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-100">
                        {header}
                      </th>
                    )}
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <tr key={subject.sb_subid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{subject.sb_miscode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate" title={subject.sb_name}>
                        {subject.sb_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          subject.sb_course === 'BSIT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {subject.sb_course}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{subject.sb_year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{subject.sb_semester}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{subject.sb_units || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleOpenEditModal(subject)} 
                              className="p-2 text-indigo-600 bg-indigo-100 rounded-full hover:bg-indigo-200 transition-colors" 
                              title="Edit"
                            >
                              <FiEdit size={16}/>
                            </button>
                            <button 
                              onClick={() => handleDeleteSubject(subject.sb_subid, subject.sb_name)} 
                              className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors" 
                              title="Delete"
                            >
                              <FiTrash2 size={16}/>
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-24 text-gray-500">
                      {searchQuery ? "No subjects found for your search." : "No subjects match the current filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

      <footer className="bg-white text-center py-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">© {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)</p>
      </footer>
    </div>
  );
}