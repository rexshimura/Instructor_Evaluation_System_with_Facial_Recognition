import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch, FiUser, FiBook, FiX, FiSave } from "react-icons/fi";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [studentSections, setStudentSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ course: 'All', year: 'All', section: 'All' });
  const [searchQuery, setSearchQuery] = useState('');
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
      .filter(section => section); // Filter out undefined sections
  };

  // Get primary section for display (first section or most relevant)
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

  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to delete "${studentName}"? This will also remove all their section assignments.`)) {
      try {
        await axios.delete(`${API_BASE}/students/${studentId}`);
        setStudents(students.filter(s => s.stud_id !== studentId));
        // Also remove related student-section assignments
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

  // Get unique section names for filter dropdown
  const getUniqueSectionNames = () => {
    const sectionNames = sections.map(section => section.sect_name);
    return [...new Set(sectionNames)].sort();
  };

  // Add Student Modal Functions
  const handleAddStudent = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
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
  };

  // Edit Student Modal Functions
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE}/students`, formData);
      const newStudent = response.data.student;
      
      setStudents(prev => [newStudent, ...prev]);
      handleCloseAddModal();
      alert('Student added successfully!');
    } catch (error) {
      console.error("Error adding student:", error);
      alert("Failed to add student. Please check the form data and try again.");
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
      
      handleCloseEditModal();
      alert('Student updated successfully!');
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student. Please check the form data and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <ModeratorNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
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
          <button
            onClick={handleAddStudent}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-150 w-full sm:w-auto justify-center"
          >
            <FiPlus /> Add New Student
          </button>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            
            <div className="text-sm text-gray-600 flex items-center">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Course</label>
              <select 
                value={filters.course} 
                onChange={(e) => setFilters(prev => ({ ...prev, course: e.target.value }))}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="All">All Courses</option>
                <option value="BSIT">BSIT</option>
                <option value="BSIS">BSIS</option>
                <option value="BSCS">BSCS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year Level</label>
              <select 
                value={filters.year} 
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="All">All Years</option>
                {[1, 2, 3, 4].map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Section</label>
              <select 
                value={filters.section} 
                onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="All">All Sections</option>
                {getUniqueSectionNames().map(sectionName => (
                  <option key={sectionName} value={sectionName}>{sectionName}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ course: 'All', year: 'All', section: 'All' })}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-150"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-6">
          {filteredStudents.map((student) => {
            const studentSectionsList = getStudentSections(student.stud_id);
            const primarySection = getPrimarySection(student.stud_id);
            
            return (
              <div key={student.stud_id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Student Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {student.stud_fname} {student.stud_lname}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          student.stud_course === 'BSIT' ? 'bg-blue-100 text-blue-800' : 
                          student.stud_course === 'BSIS' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {student.stud_course}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">ID: {student.stud_id}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <FiEdit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.stud_id, `${student.stud_fname} ${student.stud_lname}`)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-700">Year Level:</span> {student.stud_year}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Semester:</span> {student.stud_semester}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Gender:</span> {student.stud_sex || 'Not specified'}
                    </div>
                  </div>

                  {/* Section Assignments */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <FiBook className="text-blue-500" />
                      Section Assignments ({studentSectionsList.length}):
                    </h4>
                    
                    {studentSectionsList.length > 0 ? (
                      <div className="space-y-2">
                        {studentSectionsList.map((section, index) => {
                          const studentSection = studentSections.find(ss => 
                            ss.stud_id === student.stud_id && ss.section_id === section.section_id
                          );
                          
                          return (
                            <div key={section.section_id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">
                                  {section.sect_name}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {section.sect_course} • Year {section.sect_year_level} • Sem {section.sect_semester}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveFromSection(
                                  studentSection.studSect_id, 
                                  `${student.stud_fname} ${student.stud_lname}`,
                                  section.sect_name
                                )}
                                className="text-red-500 hover:text-red-700 text-xs p-1"
                                title="Remove from section"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
                        <p className="text-sm text-yellow-700">Not assigned to any sections</p>
                        <Link 
                          to={`/mod-assign-student/${student.stud_id}`} 
                          className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                        >
                          Assign to sections
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
            <FiUser className="mx-auto text-4xl mb-4 text-gray-300" />
            <p className="text-lg mb-2">No students found</p>
            <p className="text-sm text-gray-400 mb-4">
              {students.length === 0 ? "Add your first student to get started" : "Try adjusting your search or filters"}
            </p>
            {students.length === 0 && (
              <button
                onClick={handleAddStudent}
                className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-150"
              >
                <FiPlus /> Add First Student
              </button>
            )}
          </div>
        )}

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Add New Student</h2>
                <button
                  onClick={handleCloseAddModal}
                  className="text-gray-400 hover:text-gray-600 transition duration-150"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="stud_fname"
                      value={formData.stud_fname}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="stud_mname"
                      value={formData.stud_mname}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="stud_lname"
                      value={formData.stud_lname}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suffix
                    </label>
                    <input
                      type="text"
                      name="stud_suffix"
                      value={formData.stud_suffix}
                      onChange={handleInputChange}
                      placeholder="JR, III, etc."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="stud_dob"
                      value={formData.stud_dob}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="stud_sex"
                      value={formData.stud_sex}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course *
                    </label>
                    <select
                      name="stud_course"
                      value={formData.stud_course}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="BSIT">BSIT</option>
                      <option value="BSIS">BSIS</option>
                      <option value="BSCS">BSCS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Level *
                    </label>
                    <select
                      name="stud_year"
                      value={formData.stud_year}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4].map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section *
                    </label>
                    <input
                      type="text"
                      name="stud_section"
                      value={formData.stud_section}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., A, B, C"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester *
                    </label>
                    <select
                      name="stud_semester"
                      value={formData.stud_semester}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>1st Semester</option>
                      <option value={2}>2nd Semester</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Adding...' : 'Add Student'}
                  </button>
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
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Student: {editingStudent.stud_fname} {editingStudent.stud_lname}
                </h2>
                <button
                  onClick={handleCloseEditModal}
                  className="text-gray-400 hover:text-gray-600 transition duration-150"
                >
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Student ID:</strong> {editingStudent.stud_id}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Note: Student ID cannot be changed
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="stud_fname"
                      value={formData.stud_fname}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="stud_mname"
                      value={formData.stud_mname}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="stud_lname"
                      value={formData.stud_lname}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Suffix
                    </label>
                    <input
                      type="text"
                      name="stud_suffix"
                      value={formData.stud_suffix}
                      onChange={handleInputChange}
                      placeholder="JR, III, etc."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="stud_dob"
                      value={formData.stud_dob}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="stud_sex"
                      value={formData.stud_sex}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course *
                    </label>
                    <select
                      name="stud_course"
                      value={formData.stud_course}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="BSIT">BSIT</option>
                      <option value="BSIS">BSIS</option>
                      <option value="BSCS">BSCS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Level *
                    </label>
                    <select
                      name="stud_year"
                      value={formData.stud_year}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[1, 2, 3, 4].map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section *
                    </label>
                    <input
                      type="text"
                      name="stud_section"
                      value={formData.stud_section}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., A, B, C"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester *
                    </label>
                    <select
                      name="stud_semester"
                      value={formData.stud_semester}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>1st Semester</option>
                      <option value={2}>2nd Semester</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave size={16} />
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}