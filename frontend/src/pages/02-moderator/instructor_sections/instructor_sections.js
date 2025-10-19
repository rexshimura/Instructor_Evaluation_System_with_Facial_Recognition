import React, { useState, useEffect } from 'react';
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { FiUser, FiBook, FiSave, FiX, FiPlus, FiLink, FiRefreshCw } from "react-icons/fi";
import axios from "axios";

const API_BASE = "http://localhost:5000";

export default function InstructorSections() {
  const [instructors, setInstructors] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [instructorSubjects, setInstructorSubjects] = useState([]);
  const [sectionAssignments, setSectionAssignments] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        instructorsRes,
        sectionsRes,
        subjectsRes,
        instructorSubjectsRes,
        sectionAssignmentsRes
      ] = await Promise.all([
        axios.get(`${API_BASE}/instructors`),
        axios.get(`${API_BASE}/sections`),
        axios.get(`${API_BASE}/subjects`),
        axios.get(`${API_BASE}/instructor-subject`),
        axios.get(`${API_BASE}/section-assignments`)
      ]);

      setInstructors(instructorsRes.data);
      setSections(sectionsRes.data);
      setSubjects(subjectsRes.data);
      setInstructorSubjects(instructorSubjectsRes.data);
      setSectionAssignments(sectionAssignmentsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAssignments = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${API_BASE}/section-assignments`);
      setSectionAssignments(response.data);
    } catch (error) {
      console.error("Error refreshing assignments:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleInstructorSelect = (instructorId) => {
    const instructor = instructors.find(inst => inst.ins_id === instructorId);
    setSelectedInstructor(instructor);
  };

  // Get instructor's assigned sections with subjects
  const getAssignedSections = () => {
    if (!selectedInstructor) return [];
    
    const assigned = sectionAssignments
      .filter(assignment => {
        // Find the instructor_subject record to get the instructor ID
        const instructorSubject = instructorSubjects.find(is => is.insub_id === assignment.insub_id);
        return instructorSubject && instructorSubject.ins_id === selectedInstructor.ins_id;
      })
      .map(assignment => {
        const instructorSubject = instructorSubjects.find(is => is.insub_id === assignment.insub_id);
        const section = sections.find(s => s.section_id === assignment.section_id);
        const subject = subjects.find(sub => sub.sub_id === instructorSubject?.sub_id);
        
        return {
          ...assignment,
          section,
          subject,
          instructorSubject,
          ins_id: instructorSubject?.ins_id
        };
      })
      .filter(item => item.section && item.subject && item.ins_id);

    console.log("Assigned sections for instructor:", selectedInstructor.ins_id, assigned);
    return assigned;
  };

  // Get available instructor-subject combinations for assignment
  const getAvailableAssignments = () => {
    if (!selectedInstructor) return [];
    
    // Get instructor's subjects
    const instructorSubs = instructorSubjects
      .filter(is => is.ins_id === selectedInstructor.ins_id)
      .map(is => {
        const subject = subjects.find(s => s.sub_id === is.sub_id);
        return { ...is, subject };
      })
      .filter(item => item.subject);

    // Get all possible section-subject combinations
    const allCombinations = [];
    sections.forEach(section => {
      instructorSubs.forEach(instructorSub => {
        // Check if this combination is already assigned
        const isAssigned = sectionAssignments.some(assignment => 
          assignment.section_id === section.section_id && 
          assignment.insub_id === instructorSub.insub_id
        );

        if (!isAssigned) {
          allCombinations.push({
            section,
            instructorSubject: instructorSub,
            combinationId: `${section.section_id}-${instructorSub.insub_id}`
          });
        }
      });
    });

    return allCombinations;
  };

  const assignSection = async (sectionId, insubId) => {
    try {
      console.log("Assigning section:", { sect_id: sectionId, insub_id: insubId });
      
      const response = await axios.post(`${API_BASE}/section-assignments`, {
        sect_id: sectionId,
        insub_id: insubId
      });

      console.log("Assignment response:", response.data);

      // Refresh the assignments to get the complete data
      await refreshAssignments();
      alert('Section assigned successfully!');
    } catch (error) {
      console.error("Error assigning section:", error);
      console.error("Error details:", error.response?.data);
      alert(`Failed to assign section: ${error.response?.data?.error || error.message}`);
    }
  };

  const unassignSection = async (ssiId) => {
    try {
      await axios.delete(`${API_BASE}/section-assignments/${ssiId}`);
      
      // Update local state by removing the assignment
      setSectionAssignments(prev => prev.filter(assignment => assignment.ssi_id !== ssiId));
      alert('Section unassigned successfully!');
    } catch (error) {
      console.error("Error unassigning section:", error);
      console.error("Error details:", error.response?.data);
      alert(`Failed to unassign section: ${error.response?.data?.error || error.message}`);
    }
  };

  // Get instructor's subjects
  const getInstructorSubjects = () => {
    if (!selectedInstructor) return [];
    
    return instructorSubjects
      .filter(is => is.ins_id === selectedInstructor.ins_id)
      .map(is => {
        const subject = subjects.find(s => s.sub_id === is.sub_id);
        return { ...is, subject };
      })
      .filter(item => item.subject);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <ModeratorNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  const assignedSections = getAssignedSections();
  const availableAssignments = getAvailableAssignments();
  const instructorSubjectsList = getInstructorSubjects();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ModeratorNavBar />
      
      <main className="flex-1 p-4 md:p-8 max-w-screen-xl mx-auto w-full">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Instructor Section Assignment</h1>
              <p className="mt-1 text-gray-500">Assign instructors to class sections and subjects</p>
            </div>
            <button
              onClick={refreshAssignments}
              disabled={refreshing}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition duration-150"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Instructor Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Select Instructor</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {instructors.map((instructor) => (
                  <button
                    key={instructor.ins_id}
                    onClick={() => handleInstructorSelect(instructor.ins_id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedInstructor?.ins_id === instructor.ins_id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{instructor.ins_fname} {instructor.ins_lname}</div>
                    <div className="text-sm text-gray-500">{instructor.ins_dept}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      ID: {instructor.ins_id}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructor's Subjects */}
            {selectedInstructor && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiBook className="text-purple-600" />
                  Instructor's Subjects ({instructorSubjectsList.length})
                </h3>
                {instructorSubjectsList.length > 0 ? (
                  <div className="space-y-2">
                    {instructorSubjectsList.map((item) => (
                      <div key={item.insub_id} className="p-2 border border-gray-200 rounded">
                        <div className="font-medium text-sm">{item.subject.sub_name}</div>
                        <div className="text-xs text-gray-500">
                          {item.subject.sub_course} • {item.subject.sub_units} units
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No subjects assigned to this instructor</p>
                )}
              </div>
            )}
          </div>

          {/* Section Assignment */}
          <div className="lg:col-span-2">
            {selectedInstructor ? (
              <div className="space-y-6">
                {/* Instructor Info */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FiUser className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {selectedInstructor.ins_fname} {selectedInstructor.ins_lname}
                        </h2>
                        <p className="text-gray-600">{selectedInstructor.ins_dept} Department</p>
                        <p className="text-sm text-gray-500">
                          ID: {selectedInstructor.ins_id}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">
                        {assignedSections.length} assignments
                      </div>
                      <div className="text-sm text-gray-500">
                        {instructorSubjectsList.length} subjects
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Sections */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FiLink className="text-green-600" />
                      Current Assignments ({assignedSections.length})
                    </h3>
                    <button
                      onClick={refreshAssignments}
                      disabled={refreshing}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <FiRefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                  </div>
                  
                  {assignedSections.length > 0 ? (
                    <div className="space-y-3">
                      {assignedSections.map((assignment) => (
                        <div key={assignment.ssi_id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {assignment.section?.sect_name} - {assignment.subject?.sub_name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2">
                                {assignment.section?.sect_course}
                              </span>
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-2">
                                Year {assignment.section?.sect_year_level}
                              </span>
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-2">
                                Sem {assignment.section?.sect_semester}
                              </span>
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                {assignment.section?.sect_school_year}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Assignment ID: {assignment.ssi_id} • Instructor-Subject ID: {assignment.insub_id}
                            </div>
                          </div>
                          <button
                            onClick={() => unassignSection(assignment.ssi_id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                          >
                            <FiX /> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiBook className="mx-auto text-3xl text-gray-300 mb-3" />
                      <p className="text-gray-500">No section assignments yet</p>
                      <p className="text-gray-400 text-sm mt-1">Assign sections from the available options below</p>
                    </div>
                  )}
                </div>

                {/* Available Section-Subject Combinations */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiPlus className="text-blue-600" />
                    Available Assignments ({availableAssignments.length})
                  </h3>
                  
                  {availableAssignments.length > 0 ? (
                    <div className="space-y-3">
                      {availableAssignments.map((item) => (
                        <div key={item.combinationId} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {item.section.sect_name} - {item.instructorSubject.subject.sub_name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2">
                                {item.section.sect_course}
                              </span>
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-2">
                                Year {item.section.sect_year_level}
                              </span>
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-2">
                                Sem {item.section.sect_semester}
                              </span>
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                {item.instructorSubject.subject.sub_units} units
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Section ID: {item.section.section_id} • Instructor-Subject ID: {item.instructorSubject.insub_id}
                            </div>
                          </div>
                          <button
                            onClick={() => assignSection(item.section.section_id, item.instructorSubject.insub_id)}
                            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 ml-4"
                          >
                            <FiSave className="text-sm" /> Assign
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiUser className="mx-auto text-3xl text-gray-300 mb-3" />
                      <p className="text-gray-500">No available assignments</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {instructorSubjectsList.length === 0 
                          ? "This instructor needs subjects assigned first" 
                          : "All possible combinations are already assigned"
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FiUser className="mx-auto text-4xl text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Select an Instructor</h3>
                <p className="text-gray-500">Choose an instructor from the list to view and manage their section assignments</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}