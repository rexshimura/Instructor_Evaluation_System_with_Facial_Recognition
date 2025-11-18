import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiUser, FiX, FiSave, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [studentSections, setStudentSections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Search State
  const [filters, setFilters] = useState({ course: 'All', year: 'All', section: 'All' });
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    stud_fname: '',
    stud_mname: '',
    stud_lname: '',
    stud_suffix: '',
    stud_dob: '',
    stud_sex: '',
    stud_course: 'BSIT',
    stud_year: 1,
    stud_section: '',
    stud_semester: 1
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Pagination Bug Fix: Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const fetchAllData = async () => {
    try {
      const [studentsRes, sectionsRes, studentSectionsRes] = await Promise.all([
        axios.get(`${API_BASE}/students`),
        axios.get(`${API_BASE}/sections`),
        axios.get(`${API_BASE}/student-sections`)
      ]);

      setStudents(studentsRes.data);
      setSections(sectionsRes.data);
      setStudentSections(studentSectionsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get sections for a specific student
  const getStudentSections = (studentId) => {
    return studentSections
      .filter(ss => ss.stud_id === studentId)
      .map(ss => {
        const section = sections.find(s => s.section_id === ss.section_id);
        return section;
      })
      .filter(section => section);
  };

  // Get primary section for display
  const getPrimarySection = (studentId) => {
    const studentSectionsList = getStudentSections(studentId);
    return studentSectionsList.length > 0 ? studentSectionsList[0] : null;
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      student.stud_fname?.toLowerCase().includes(searchLower) ||
      student.stud_lname?.toLowerCase().includes(searchLower) ||
      student.stud_id?.toString().includes(searchLower);

    const primarySection = getPrimarySection(student.stud_id);
    const sectionName = primarySection?.sect_name || 'No Section';

    return (
      matchesSearch &&
      (filters.course === 'All' || student.stud_course === filters.course) &&
      (filters.year === 'All' || student.stud_year?.toString() === filters.year) &&
      (filters.section === 'All' || sectionName === filters.section)
    );
  });

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to delete "${studentName}"? This will also remove all their section assignments.`)) {
      try {
        await axios.delete(`${API_BASE}/students/${studentId}`);
        setStudents(students.filter(s => s.stud_id !== studentId));
        setStudentSections(prev => prev.filter(ss => ss.stud_id !== studentId));
      } catch (error) {
        console.error("Error deleting student:", error);
        alert("Failed to delete student. The student may have evaluation records that need to be deleted first.");
      }
    }
  };

  const handleRemoveFromSection = async (studSectId, studentName, sectionName) => {
    if (window.confirm(`Remove ${studentName} from ${sectionName}?`)) {
      try {
        await axios.delete(`${API_BASE}/student-sections/${studSectId}`);
        setStudentSections(prev => prev.filter(ss => ss.studSect_id !== studSectId));
      } catch (error) {
        console.error("Error removing student from section:", error);
        alert("Failed to remove student from section");
      }
    }
  };

  const getUniqueSectionNames = () => {
    const sectionNames = sections.map(section => section.sect_name);
    return [...new Set(sectionNames)].sort();
  };

  // Modal Handlers
  const handleAddStudent = () => setShowAddModal(true);

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      stud_fname: '', stud_mname: '', stud_lname: '', stud_suffix: '',
      stud_dob: '', stud_sex: '', stud_course: 'BSIT',
      stud_year: 1, stud_section: '', stud_semester: 1
    });
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormData({
      stud_fname: student.stud_fname || '',
      stud_mname: student.stud_mname || '',
      stud_lname: student.stud_lname || '',
      stud_suffix: student.stud_suffix || '',
      stud_dob: student.stud_dob ? new Date(student.stud_dob).toISOString().split('T')[0] : '',
      stud_sex: student.stud_sex || '',
      stud_course: student.stud_course || 'BSIT',
      stud_year: student.stud_year || 1,
      stud_section: student.stud_section || '',
      stud_semester: student.stud_semester || 1
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingStudent(null);
    setFormData({
      stud_fname: '', stud_mname: '', stud_lname: '', stud_suffix: '',
      stud_dob: '', stud_sex: '', stud_course: 'BSIT',
      stud_year: 1, stud_section: '', stud_semester: 1
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE}/students`, formData);
      const newStudent = response.data.student;
      setStudents(prev => [newStudent, ...prev]);
      
      // Auto-assign student to selected section if section is provided
      if (formData.stud_section) {
        const selectedSection = sections.find(section => section.sect_name === formData.stud_section);
        if (selectedSection) {
          try {
            await axios.post(`${API_BASE}/student-sections`, {
              stud_id: newStudent.stud_id,
              section_id: selectedSection.section_id
            });
            // Refresh student sections data
            const studentSectionsRes = await axios.get(`${API_BASE}/student-sections`);
            setStudentSections(studentSectionsRes.data);
          } catch (sectionError) {
            console.error("Error assigning student to section:", sectionError);
            // Don't block the success if section assignment fails
          }
        }
      }
      
      handleCloseAddModal();
      alert('Student added successfully!');
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.put(`${API_BASE}/students/${editingStudent.stud_id}`, formData);
      const updatedStudent = response.data.updated;
      setStudents(prev => prev.map(student =>
        student.stud_id === editingStudent.stud_id ? { ...student, ...updatedStudent } : student
      ));
      
      // Handle section assignment for edited student
      if (formData.stud_section) {
        const selectedSection = sections.find(section => section.sect_name === formData.stud_section);
        if (selectedSection) {
          try {
            // Check if student already has this section assignment
            const existingAssignment = studentSections.find(ss =>
              ss.stud_id === editingStudent.stud_id && ss.section_id === selectedSection.section_id
            );
            
            if (!existingAssignment) {
              // Add new section assignment
              await axios.post(`${API_BASE}/student-sections`, {
                stud_id: editingStudent.stud_id,
                section_id: selectedSection.section_id
              });
            }
            
            // Refresh student sections data
            const studentSectionsRes = await axios.get(`${API_BASE}/student-sections`);
            setStudentSections(studentSectionsRes.data);
          } catch (sectionError) {
            console.error("Error updating student section assignment:", sectionError);
            // Don't block the success if section assignment fails
          }
        }
      }
      
      handleCloseEditModal();
      alert('Student updated successfully!');
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <ModeratorNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ModeratorNavBar />
      
      <main className="flex-1 p-4 md:p-8 max-w-screen-xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
          <p className="mt-1 text-gray-500">Manage student accounts and section assignments</p>
        </header>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button onClick={handleAddStudent} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-150 w-full sm:w-auto justify-center">
            <FiPlus /> Add New Student
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Course</label>
              <select value={filters.course} onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))} className="block w-full p-2 border border-gray-300 rounded-md text-sm">
                <option value="All">All Courses</option>
                <option value="BSIT">BSIT</option>
                <option value="BSIS">BSIS</option>
                <option value="BSCS">BSCS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Year Level</label>
              <select value={filters.year} onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))} className="block w-full p-2 border border-gray-300 rounded-md text-sm">
                <option value="All">All Years</option>
                {[1, 2, 3, 4].map(year => <option key={year} value={year}>Year {year}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Section</label>
              <select value={filters.section} onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))} className="block w-full p-2 border border-gray-300 rounded-md text-sm">
                <option value="All">All Sections</option>
                {getUniqueSectionNames().map(sectionName => <option key={sectionName} value={sectionName}>{sectionName}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => setFilters({ course: 'All', year: 'All', section: 'All' })} className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded hover:bg-gray-200 transition duration-150 text-sm font-medium">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course & Year</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Sections</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.length > 0 ? (
                  currentStudents.map((student) => {
                    const studentSectionsList = getStudentSections(student.stud_id);
                    return (
                      <tr key={student.stud_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {student.stud_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.stud_fname} {student.stud_lname} {student.stud_suffix}</div>
                          <div className="text-xs text-gray-500">{student.stud_sex || 'N/A'} • DOB: {new Date(student.stud_dob).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${student.stud_course === 'BSIT' ? 'bg-blue-100 text-blue-800' : 
                              student.stud_course === 'BSIS' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                            {student.stud_course}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">Year {student.stud_year} • Sem {student.stud_semester}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {studentSectionsList.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {studentSectionsList.map((section) => {
                                const studentSection = studentSections.find(ss => 
                                  ss.stud_id === student.stud_id && ss.section_id === section.section_id
                                );
                                return (
                                  <span key={section.section_id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                    {section.sect_name}
                                    <button 
                                      onClick={() => handleRemoveFromSection(studentSection.studSect_id, `${student.stud_fname} ${student.stud_lname}`, section.sect_name)}
                                      className="ml-1.5 text-gray-400 hover:text-red-500 focus:outline-none"
                                    >
                                      <FiX size={12} />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-yellow-600 text-xs italic bg-yellow-50 px-2 py-1 rounded">No sections</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEditStudent(student)} className="text-blue-600 hover:text-blue-900 mr-3" title="Edit">
                            <FiEdit size={16} />
                          </button>
                          <button onClick={() => handleDeleteStudent(student.stud_id, `${student.stud_fname} ${student.stud_lname}`)} className="text-red-600 hover:text-red-900" title="Delete">
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <FiUser className="mx-auto text-4xl mb-3 text-gray-300" />
                      <p>No students found matching your criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredStudents.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Previous</span>
                      <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Simple Page Indicator */}
                    <div className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </div>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Next</span>
                      <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
              {/* Mobile Pagination View */}
              <div className="flex sm:hidden justify-between w-full">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50">Previous</button>
                <span className="text-sm py-2">Page {currentPage}</span>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border rounded text-sm font-medium disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>

        {/* Add Student Modal - (Unchanged from original structure) */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Add New Student</h2>
                <button onClick={handleCloseAddModal} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                {/* ... Form inputs ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" name="stud_fname" value={formData.stud_fname} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label><input type="text" name="stud_mname" value={formData.stud_mname} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input type="text" name="stud_lname" value={formData.stud_lname} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label><input type="text" name="stud_suffix" value={formData.stud_suffix} onChange={handleInputChange} placeholder="JR, III" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">DOB *</label><input type="date" name="stud_dob" value={formData.stud_dob} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label><select name="stud_sex" value={formData.stud_sex} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Course *</label><select name="stud_course" value={formData.stud_course} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value="BSIT">BSIT</option><option value="BSIS">BSIS</option><option value="BSCS">BSCS</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Year *</label><select name="stud_year" value={formData.stud_year} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">{[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Section *</label><select name="stud_section" value={formData.stud_section} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value="">Select Section</option>{sections.map(section => <option key={section.section_id} value={section.sect_name}>{section.sect_name}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label><select name="stud_semester" value={formData.stud_semester} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value={1}>1st</option><option value={2}>2nd</option></select></div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={handleCloseAddModal} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">{submitting ? 'Adding...' : 'Add Student'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditModal && editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Edit Student</h2>
                <button onClick={handleCloseEditModal} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-700"><strong>ID:</strong> {editingStudent.stud_id}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" name="stud_fname" value={formData.stud_fname} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label><input type="text" name="stud_mname" value={formData.stud_mname} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input type="text" name="stud_lname" value={formData.stud_lname} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label><input type="text" name="stud_suffix" value={formData.stud_suffix} onChange={handleInputChange} placeholder="JR, III" className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">DOB *</label><input type="date" name="stud_dob" value={formData.stud_dob} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label><select name="stud_sex" value={formData.stud_sex} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Course *</label><select name="stud_course" value={formData.stud_course} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value="BSIT">BSIT</option><option value="BSIS">BSIS</option><option value="BSCS">BSCS</option></select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Year *</label><select name="stud_year" value={formData.stud_year} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">{[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Section *</label><select name="stud_section" value={formData.stud_section} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value="">Select Section</option>{sections.map(section => <option key={section.section_id} value={section.sect_name}>{section.sect_name}</option>)}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label><select name="stud_semester" value={formData.stud_semester} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"><option value={1}>1st</option><option value={2}>2nd</option></select></div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={handleCloseEditModal} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"><FiSave size={16} />{submitting ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}