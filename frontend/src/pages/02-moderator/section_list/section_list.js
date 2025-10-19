import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { FiEdit, FiTrash2, FiPlus, FiFilter, FiSearch, FiBook, FiUsers, FiX, FiUser, FiUserPlus } from "react-icons/fi";
import axios from "axios";

const API_BASE = "http://localhost:5000";

// Edit Section Modal Component
const EditSectionModal = ({ show, onClose, section, onSave }) => {
  const [formData, setFormData] = useState({
    sect_name: '',
    sect_semester: 1,
    sect_year_level: 1,
    sect_school_year: '',
    sect_course: 'BSIT'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (section) {
      setFormData({
        sect_name: section.sect_name || '',
        sect_semester: section.sect_semester || 1,
        sect_year_level: section.sect_year_level || 1,
        sect_school_year: section.sect_school_year || '',
        sect_course: section.sect_course || 'BSIT'
      });
    }
  }, [section]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(section.section_id, formData);
      onClose();
    } catch (error) {
      console.error("Error updating section:", error);
      alert("Failed to update section");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate school year options (current year to next year)
  const currentYear = new Date().getFullYear();
  const schoolYearOptions = [
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
    `${currentYear + 2}-${currentYear + 3}`
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Edit Section</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Name *
            </label>
            <input
              type="text"
              name="sect_name"
              value={formData.sect_name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Section A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Level *
              </label>
              <select
                name="sect_year_level"
                value={formData.sect_year_level}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4].map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select
                name="sect_semester"
                value={formData.sect_semester}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Year *
            </label>
            <select
              name="sect_school_year"
              value={formData.sect_school_year}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select School Year</option>
              {schoolYearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course *
            </label>
            <select
              name="sect_course"
              value={formData.sect_course}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="BSIT">BSIT</option>
              <option value="BSIS">BSIS</option>
              <option value="BSCS">BSCS</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create Section Modal Component
const CreateSectionModal = ({ show, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    sect_name: '',
    sect_semester: 1,
    sect_year_level: 1,
    sect_school_year: '',
    sect_course: 'BSIT'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      // Reset form when modal opens
      setFormData({
        sect_name: '',
        sect_semester: 1,
        sect_year_level: 1,
        sect_school_year: '',
        sect_course: 'BSIT'
      });
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error creating section:", error);
      alert("Failed to create section");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate school year options
  const currentYear = new Date().getFullYear();
  const schoolYearOptions = [
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
    `${currentYear + 2}-${currentYear + 3}`
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Create New Section</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Name *
            </label>
            <input
              type="text"
              name="sect_name"
              value={formData.sect_name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Section A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Level *
              </label>
              <select
                name="sect_year_level"
                value={formData.sect_year_level}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4].map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select
                name="sect_semester"
                value={formData.sect_semester}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Year *
            </label>
            <select
              name="sect_school_year"
              value={formData.sect_school_year}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select School Year</option>
              {schoolYearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course *
            </label>
            <select
              name="sect_course"
              value={formData.sect_course}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="BSIT">BSIT</option>
              <option value="BSIS">BSIS</option>
              <option value="BSCS">BSCS</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Section Students Modal Component
const SectionStudentsModal = ({ show, onClose, section, onAssignStudent, onRemoveStudent }) => {
  const [allStudents, setAllStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [sectionStudents, setSectionStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && section) {
      fetchStudentsData();
    }
  }, [show, section]);

  const fetchStudentsData = async () => {
    try {
      const [studentsRes, studentSectionsRes] = await Promise.all([
        axios.get(`${API_BASE}/students`),
        axios.get(`${API_BASE}/student-sections`)
      ]);

      const allStudentsData = studentsRes.data;
      const studentSectionsData = studentSectionsRes.data;

      // Get students already in this section
      const currentSectionStudents = studentSectionsData
        .filter(ss => ss.section_id === section.section_id)
        .map(ss => {
          const student = allStudentsData.find(s => s.stud_id === ss.stud_id);
          return student ? { ...student, studSect_id: ss.studSect_id } : null;
        })
        .filter(Boolean);

      // Get available students (not in this section and matching course/year/semester)
      const available = allStudentsData.filter(student => 
        !currentSectionStudents.some(s => s.stud_id === student.stud_id) &&
        student.stud_course === section.sect_course &&
        student.stud_year === section.sect_year_level &&
        student.stud_semester === section.sect_semester
      );

      setAllStudents(allStudentsData);
      setSectionStudents(currentSectionStudents);
      setAvailableStudents(available);
    } catch (error) {
      console.error("Error fetching students data:", error);
    }
  };

  if (!show || !section) return null;

  const handleAssignStudent = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      await onAssignStudent(section.section_id, selectedStudent);
      setSelectedStudent('');
      await fetchStudentsData(); // Refresh data
    } catch (error) {
      console.error("Error assigning student:", error);
      alert("Failed to assign student to section");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studSectId, studentName) => {
    if (window.confirm(`Remove ${studentName} from ${section.sect_name}?`)) {
      try {
        await onRemoveStudent(studSectId);
        await fetchStudentsData(); // Refresh data
      } catch (error) {
        console.error("Error removing student:", error);
        alert("Failed to remove student from section");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Students in {section.sect_name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {section.sect_course} • Year {section.sect_year_level} • Sem {section.sect_semester}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Add Student to Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <FiUserPlus />
              Add Student to Section
            </h3>
            <div className="flex gap-3">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a student...</option>
                {availableStudents.map(student => (
                  <option key={student.stud_id} value={student.stud_id}>
                    {student.stud_fname} {student.stud_lname} (ID: {student.stud_id})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignStudent}
                disabled={!selectedStudent || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Adding...' : 'Add Student'}
              </button>
            </div>
            {availableStudents.length === 0 && (
              <p className="text-sm text-blue-600 mt-2">
                No available students match this section's criteria.
              </p>
            )}
          </div>

          {/* Current Students List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Current Students ({sectionStudents.length})
            </h3>
            {sectionStudents.length > 0 ? (
              <div className="space-y-3">
                {sectionStudents.map(student => (
                  <div key={student.studSect_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                    <div>
                      <div className="font-medium text-gray-800">
                        {student.stud_fname} {student.stud_lname}
                      </div>
                      <div className="text-sm text-gray-600">
                        ID: {student.stud_id} • {student.stud_course}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student.studSect_id, `${student.stud_fname} ${student.stud_lname}`)}
                      className="text-red-500 hover:text-red-700 text-sm p-2"
                      title="Remove from section"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border">
                <FiUsers className="mx-auto text-3xl mb-2 text-gray-300" />
                <p>No students assigned to this section yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SectionList() {
  const [sections, setSections] = useState([]);
  const [sectionAssignments, setSectionAssignments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [instructorSubjects, setInstructorSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ course: 'All', year: 'All', semester: 'All' });
  const [editModal, setEditModal] = useState({ show: false, section: null });
  const [createModal, setCreateModal] = useState(false);
  const [studentsModal, setStudentsModal] = useState({ show: false, section: null });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [
        sectionsRes,
        sectionAssignmentsRes,
        instructorsRes,
        subjectsRes,
        instructorSubjectsRes
      ] = await Promise.all([
        axios.get(`${API_BASE}/sections`),
        axios.get(`${API_BASE}/section-assignments`),
        axios.get(`${API_BASE}/instructors`),
        axios.get(`${API_BASE}/subjects`),
        axios.get(`${API_BASE}/instructor-subject`)
      ]);

      setSections(sectionsRes.data);
      setSectionAssignments(sectionAssignmentsRes.data);
      setInstructors(instructorsRes.data);
      setSubjects(subjectsRes.data);
      setInstructorSubjects(instructorSubjectsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get assignments for a specific section
  const getSectionAssignments = (sectionId) => {
    return sectionAssignments
      .filter(assignment => assignment.section_id === sectionId)
      .map(assignment => {
        const instructorSubject = instructorSubjects.find(is => is.insub_id === assignment.insub_id);
        const instructor = instructorSubject ? instructors.find(inst => inst.ins_id === instructorSubject.ins_id) : null;
        const subject = instructorSubject ? subjects.find(sub => sub.sub_id === instructorSubject.sub_id) : null;
        
        return {
          ...assignment,
          instructor,
          subject,
          instructorSubject
        };
      })
      .filter(item => item.instructor && item.subject); // Filter out incomplete data
  };

  const filteredSections = sections.filter(section => {
    return (
      (filters.course === 'All' || section.sect_course === filters.course) &&
      (filters.year === 'All' || section.sect_year_level?.toString() === filters.year) &&
      (filters.semester === 'All' || section.sect_semester?.toString() === filters.semester)
    );
  });

  const handleDeleteSection = async (sectionId, sectionName) => {
    if (window.confirm(`Are you sure you want to delete section "${sectionName}"? This will also remove all instructor assignments for this section.`)) {
      try {
        await axios.delete(`${API_BASE}/sections/${sectionId}`);
        setSections(sections.filter(s => s.section_id !== sectionId));
        // Also remove related assignments from local state
        setSectionAssignments(prev => prev.filter(assignment => assignment.section_id !== sectionId));
      } catch (error) {
        console.error("Error deleting section:", error);
        alert("Failed to delete section. Make sure no students are enrolled in this section.");
      }
    }
  };

  const handleEditSection = async (sectionId, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE}/sections/${sectionId}`, updatedData);
      setSections(sections.map(s => 
        s.section_id === sectionId ? { ...s, ...updatedData } : s
      ));
    } catch (error) {
      console.error("Error updating section:", error);
      throw error;
    }
  };

  const handleCreateSection = async (sectionData) => {
    try {
      const response = await axios.post(`${API_BASE}/sections`, sectionData);
      setSections(prev => [response.data.section, ...prev]);
    } catch (error) {
      console.error("Error creating section:", error);
      throw error;
    }
  };

  // FIXED: Use the correct parameter names for student-sections endpoint
  const handleAssignStudent = async (sectionId, studentId) => {
    try {
      await axios.post(`${API_BASE}/student-sections`, {
        sect_id: sectionId,  // Changed from section_id to sect_id
        stud_id: studentId
      });
    } catch (error) {
      console.error("Error assigning student:", error);
      throw error;
    }
  };

  const handleRemoveStudent = async (studSectId) => {
    try {
      await axios.delete(`${API_BASE}/student-sections/${studSectId}`);
    } catch (error) {
      console.error("Error removing student:", error);
      throw error;
    }
  };

  const handleUnassignInstructor = async (ssiId) => {
    if (window.confirm("Are you sure you want to remove this instructor from the section?")) {
      try {
        await axios.delete(`${API_BASE}/section-assignments/${ssiId}`);
        setSectionAssignments(prev => prev.filter(assignment => assignment.ssi_id !== ssiId));
      } catch (error) {
        console.error("Error removing instructor assignment:", error);
        alert("Failed to remove instructor from section");
      }
    }
  };

  const openEditModal = (section) => {
    setEditModal({ show: true, section });
  };

  const closeEditModal = () => {
    setEditModal({ show: false, section: null });
  };

  const openCreateModal = () => {
    setCreateModal(true);
  };

  const closeCreateModal = () => {
    setCreateModal(false);
  };

  const openStudentsModal = (section) => {
    setStudentsModal({ show: true, section });
  };

  const closeStudentsModal = () => {
    setStudentsModal({ show: false, section: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <ModeratorNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sections...</p>
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
          <h1 className="text-3xl font-bold text-gray-800">Section Management</h1>
          <p className="mt-1 text-gray-500">Create and manage class sections</p>
        </header>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-150"
          >
            <FiPlus /> Create New Section
          </button>
          
          <div className="text-sm text-gray-600">
            {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} found
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
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <select 
                value={filters.semester} 
                onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="All">All Semesters</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ course: 'All', year: 'All', semester: 'All' })}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-150"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSections.map((section) => {
            const assignments = getSectionAssignments(section.section_id);
            
            return (
              <div key={section.section_id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* Section Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{section.sect_name}</h3>
                      <p className="text-sm text-gray-500">{section.sect_school_year}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      section.sect_course === 'BSIT' ? 'bg-blue-100 text-blue-800' : 
                      section.sect_course === 'BSIS' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {section.sect_course}
                    </span>
                  </div>
                  
                  {/* Section Details */}
                  <div className="space-y-3 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Year Level:</span>
                      <span className="font-medium">Year {section.sect_year_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Semester:</span>
                      <span className="font-medium">{section.sect_semester}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Instructor Assignments:</span>
                      <span className="font-medium">{assignments.length}</span>
                    </div>
                  </div>

                  {/* Instructor Assignments */}
                  {assignments.length > 0 ? (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <FiUser className="text-blue-500" />
                        Assigned Instructors & Subjects:
                      </h4>
                      <div className="space-y-2">
                        {assignments.map((assignment) => (
                          <div key={assignment.ssi_id} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-800">
                                {assignment.instructor.ins_fname} {assignment.instructor.ins_lname}
                              </div>
                              <div className="text-xs text-gray-600">
                                {assignment.subject.sub_name}
                              </div>
                            </div>
                            <button
                              onClick={() => handleUnassignInstructor(assignment.ssi_id)}
                              className="text-red-500 hover:text-red-700 text-xs p-1"
                              title="Remove assignment"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
                      <p className="text-sm text-yellow-700">No instructors assigned</p>
                      <Link 
                        to="/mod-instructor-sections" 
                        className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                      >
                        Assign instructors
                      </Link>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => openEditModal(section)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <FiEdit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => openStudentsModal(section)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      <FiUsers size={14} /> Students
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.section_id, section.sect_name)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      <FiTrash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSections.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
            <FiBook className="mx-auto text-4xl mb-4 text-gray-300" />
            <p className="text-lg mb-2">No sections found</p>
            <p className="text-sm text-gray-400 mb-4">
              {sections.length === 0 ? "Create your first section to get started" : "Try adjusting your filters"}
            </p>
            {sections.length === 0 && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-150"
              >
                <FiPlus /> Create First Section
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <EditSectionModal
        show={editModal.show}
        onClose={closeEditModal}
        section={editModal.section}
        onSave={handleEditSection}
      />

      <CreateSectionModal
        show={createModal}
        onClose={closeCreateModal}
        onSave={handleCreateSection}
      />

      <SectionStudentsModal
        show={studentsModal.show}
        onClose={closeStudentsModal}
        section={studentsModal.section}
        onAssignStudent={handleAssignStudent}
        onRemoveStudent={handleRemoveStudent}
      />
    </div>
  );
}