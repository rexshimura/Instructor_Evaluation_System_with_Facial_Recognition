import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModeratorFormNavBar from "../../../components/module_layout/Moderator-FormNavbar";

// Loading Overlay Component
const LoadingOverlay = ({ message }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-900 bg-opacity-75 z-50 transition-opacity duration-300">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-white text-xl font-bold">{message}</p>
      </div>
    </div>
  );
};

// InputText component
const InputText = ({ label, value, onChange, placeholder, type = "text", required, name, readOnly = false }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 ${readOnly ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}`}
        required={required}
        readOnly={readOnly}
      />
    </div>
  );
};

// InputDateOfBirth component
const InputDateOfBirth = ({ value, onChange, required, name }) => {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const maxDate = today.toISOString().split("T")[0];

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        Date of Birth {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
        required={required}
        max={maxDate}
      />
    </div>
  );
};

const InstructorForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [currentModerator, setCurrentModerator] = useState(null);

  const [formData, setFormData] = useState({
    personalInfo: {
      ins_fname: '',
      ins_mname: '',
      ins_lname: '',
      ins_suffix: '',
      ins_dob: '',
      ins_sex: '',
    },
    contactDetails: {
      ins_email: '',
      ins_contact: '',
    },
    department: {
      ins_dept: '',
    },
    subjectLoad: [
      {
        sub_id: '',
        subjectName: '',
        course: '',
        miscode: '',
        units: '',
        semester: '',
        year: '',
        isConfirmed: false,
        validationError: '',
      },
    ],
  });

  // Fetch subjects and current moderator from sessionStorage
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/subjects');
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        } else {
          throw new Error('Failed to fetch subjects');
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Failed to load subjects. Please refresh the page.');
      }
    };

    // Get current moderator from sessionStorage
    const userData = sessionStorage.getItem('user');
    console.log('Raw user data from sessionStorage:', userData);

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user data:', parsedUser);

        // Check if it's a moderator object
        if (parsedUser.mod_id) {
          setCurrentModerator(parsedUser);
        } else {
          console.warn('User data found but not a moderator:', parsedUser);
          setError('User data found but not a moderator. Please log in as a moderator.');
        }
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        setError('Error reading user data. Please log in again.');
      }
    } else {
      console.warn('No user data found in sessionStorage');
      setError('No user session found. Please log in again.');
    }

    fetchSubjects();
  }, []);

  // Filter subjects by selected department
  const getAvailableSubjects = () => {
    if (!formData.department.ins_dept) {
      return [];
    }
    return subjects.filter(subject => subject.sub_course === formData.department.ins_dept);
  };

  const handleChange = (e, fieldSet, index) => {
    const { name, value } = e.target;
    
    if (fieldSet === 'subjectLoad') {
      const newSubjectLoad = [...formData.subjectLoad];
      newSubjectLoad[index][name] = value;
      
      // Reset confirmation when any field changes
      newSubjectLoad[index].isConfirmed = false;
      newSubjectLoad[index].validationError = '';
      
      if (name === 'subjectName') {
        const selectedSubject = subjects.find(
          (subject) => subject.sub_name === value
        );
        
        if (selectedSubject) {
          newSubjectLoad[index].sub_id = selectedSubject.sub_id;
          newSubjectLoad[index].miscode = selectedSubject.sub_miscode;
          newSubjectLoad[index].units = selectedSubject.sub_units.toString();
          newSubjectLoad[index].course = selectedSubject.sub_course;
          newSubjectLoad[index].year = selectedSubject.sub_year.toString();
          newSubjectLoad[index].semester = selectedSubject.sub_semester.toString();
        } else {
          // Reset fields if subject is deselected
          newSubjectLoad[index].sub_id = '';
          newSubjectLoad[index].miscode = '';
          newSubjectLoad[index].units = '';
          newSubjectLoad[index].course = '';
          newSubjectLoad[index].year = '';
          newSubjectLoad[index].semester = '';
        }
      }
      setFormData({ ...formData, subjectLoad: newSubjectLoad });
    } else {
      const newFormData = {
        ...formData,
        [fieldSet]: {
          ...formData[fieldSet],
          [name]: value,
        },
      };

      // If department changed, clear all subject selections
      if (fieldSet === 'department' && name === 'ins_dept') {
        newFormData.subjectLoad = newFormData.subjectLoad.map(subject => ({
          ...subject,
          sub_id: '',
          subjectName: '',
          course: '',
          miscode: '',
          units: '',
          semester: '',
          year: '',
          isConfirmed: false,
          validationError: '',
        }));
      }

      setFormData(newFormData);
    }
  };

  const addSubject = () => {
    // Check if there are available subjects to add
    const availableSubjects = getAvailableSubjects();
    const usedSubjectIds = formData.subjectLoad.map(subject => subject.sub_id).filter(Boolean);
    const availableSlots = availableSubjects.filter(subject => !usedSubjectIds.includes(subject.sub_id));
    
    if (availableSlots.length === 0) {
      setError("No more available subjects to add for this department.");
      return;
    }

    setFormData(prevData => ({
      ...prevData,
      subjectLoad: [
        ...prevData.subjectLoad,
        {
          sub_id: '',
          subjectName: '',
          course: '',
          miscode: '',
          units: '',
          semester: '',
          year: '',
          isConfirmed: false,
          validationError: '',
        },
      ],
    }));
    setError(''); // Clear any previous errors
  };

  const removeSubject = (index) => {
    if (formData.subjectLoad.length === 1) {
      setError("At least one subject is required.");
      return;
    }
    const newSubjectLoad = formData.subjectLoad.filter((_, i) => i !== index);
    setFormData({ ...formData, subjectLoad: newSubjectLoad });
    setError(''); // Clear any previous errors
  };

  const confirmSubject = (index) => {
    const subject = formData.subjectLoad[index];
    const newSubjectLoad = [...formData.subjectLoad];

    // Check if all required fields are filled
    if (!subject.subjectName || !subject.sub_id) {
      newSubjectLoad[index].validationError = "Please select a valid subject before confirming.";
      setFormData({ ...formData, subjectLoad: newSubjectLoad });
      return;
    }

    // Check if subject belongs to the selected department
    const selectedSubject = subjects.find(s => s.sub_name === subject.subjectName);
    if (selectedSubject && selectedSubject.sub_course !== formData.department.ins_dept) {
      newSubjectLoad[index].validationError = "This subject does not belong to the selected department.";
      setFormData({ ...formData, subjectLoad: newSubjectLoad });
      return;
    }

    // Check for duplicate subjects
    const duplicateIndex = formData.subjectLoad.findIndex((sub, i) => 
      i !== index && sub.sub_id === subject.sub_id && sub.isConfirmed
    );
    
    if (duplicateIndex !== -1) {
      newSubjectLoad[index].validationError = "This subject has already been added and confirmed.";
      setFormData({ ...formData, subjectLoad: newSubjectLoad });
      return;
    }

    newSubjectLoad[index].isConfirmed = true;
    newSubjectLoad[index].validationError = '';
    setFormData({ ...formData, subjectLoad: newSubjectLoad });

    // Clear any previous errors
    setError('');
  };

  const validateForm = () => {
    // Check personal info
    if (!formData.personalInfo.ins_fname?.trim() || 
        !formData.personalInfo.ins_lname?.trim() || 
        !formData.personalInfo.ins_dob || 
        !formData.personalInfo.ins_sex) {
      return "Please fill in all required personal information fields.";
    }

    // Check contact details
    if (!formData.contactDetails.ins_email?.trim() || 
        !formData.contactDetails.ins_contact?.trim()) {
      return "Please fill in all required contact details.";
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactDetails.ins_email)) {
      return "Please enter a valid email address.";
    }

    // Validate contact number (basic validation)
    const contactRegex = /^[\d\s\-+()]{10,}$/;
    if (!contactRegex.test(formData.contactDetails.ins_contact)) {
      return "Please enter a valid contact number.";
    }

    if (!formData.department.ins_dept) {
      return "Please select a department.";
    }

    // Check if all subjects are confirmed
    const allSubjectsConfirmed = formData.subjectLoad.every(sub => sub.isConfirmed);
    if (!allSubjectsConfirmed) {
      return "Please confirm all subjects before proceeding. Click the 'Confirm' button for each subject.";
    }

    // Check if at least one subject is selected
    if (formData.subjectLoad.length === 0) {
      return "At least one subject is required.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!currentModerator) {
      setError("Moderator information not found. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Prepare instructor data for API
      const instructorData = {
        ins_fname: formData.personalInfo.ins_fname.trim(),
        ins_mname: formData.personalInfo.ins_mname?.trim() || '',
        ins_lname: formData.personalInfo.ins_lname.trim(),
        ins_suffix: formData.personalInfo.ins_suffix?.trim() || '',
        ins_dob: formData.personalInfo.ins_dob,
        ins_sex: formData.personalInfo.ins_sex,
        ins_email: formData.contactDetails.ins_email.trim(),
        ins_contact: formData.contactDetails.ins_contact.trim(),
        ins_dept: formData.department.ins_dept,
        moderator_id: currentModerator.mod_id
      };

      console.log('Submitting instructor data:', instructorData);

      // Step 1: Create instructor
      const instructorResponse = await fetch('/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instructorData),
      });

      if (!instructorResponse.ok) {
        const errorText = await instructorResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `HTTP error! status: ${instructorResponse.status}`);
      }

      const instructorResult = await instructorResponse.json();
      console.log('Instructor created successfully:', instructorResult);
      
      const instructorId = instructorResult.ins.ins_id;
      
      // Step 2: Create instructor-subject relationships
      const subjectPromises = formData.subjectLoad.map(async (subject) => {
        const subjectLinkData = {
          ins_id: instructorId,
          sub_id: subject.sub_id
        };

        console.log('Creating instructor-subject link:', subjectLinkData);

        const subjectResponse = await fetch('/instructor-subject', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subjectLinkData),
        });

        if (!subjectResponse.ok) {
          const errorText = await subjectResponse.text();
          throw new Error(`Failed to link subject: ${errorText}`);
        }

        return subjectResponse.json();
      });

      await Promise.all(subjectPromises);
      console.log('All subject links created successfully');
      
      // Show success message and navigate
      alert('Instructor registered successfully!');
      navigate("/mod-panel");
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get available subjects for the selected department
  const availableSubjects = getAvailableSubjects();
  
  // Get unique subject names that haven't been confirmed yet
  const availableSubjectNames = availableSubjects
    .filter(subject => {
      // Filter out subjects that are already confirmed in other slots
      const isAlreadyConfirmed = formData.subjectLoad.some(
        sub => sub.sub_id === subject.sub_id && sub.isConfirmed
      );
      return !isAlreadyConfirmed;
    })
    .map(subject => subject.sub_name)
    .filter(Boolean);

  const allSubjectsConfirmed = formData.subjectLoad.every(subject => subject.isConfirmed);
  const canAddMoreSubjects = availableSubjectNames.length > 0;

  return (
    <>
      <ModeratorFormNavBar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Instructor Registration Form</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info */}
            <section>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputText
                  label="First Name"
                  name="ins_fname"
                  value={formData.personalInfo.ins_fname}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  placeholder="Enter first name"
                  required
                />
                <InputText
                  label="Middle Name"
                  name="ins_mname"
                  value={formData.personalInfo.ins_mname}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  placeholder="Enter middle name"
                />
                <InputText
                  label="Last Name"
                  name="ins_lname"
                  value={formData.personalInfo.ins_lname}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <InputText
                  label="Suffix"
                  name="ins_suffix"
                  value={formData.personalInfo.ins_suffix}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  placeholder="e.g., Jr., Sr."
                />
                <InputDateOfBirth
                  name="ins_dob"
                  value={formData.personalInfo.ins_dob}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  required
                />
                <div>
                  <label htmlFor="ins_sex" className="block text-sm font-medium text-gray-700">
                    Sex<span className="text-red-500">*</span>
                  </label>
                  <select
                    id="ins_sex"
                    name="ins_sex"
                    value={formData.personalInfo.ins_sex}
                    onChange={(e) => handleChange(e, 'personalInfo')}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Contact Details */}
            <section>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputText
                  label="Email Address"
                  name="ins_email"
                  value={formData.contactDetails.ins_email}
                  onChange={(e) => handleChange(e, 'contactDetails')}
                  placeholder="Enter email"
                  type="email"
                  required
                />
                <InputText
                  label="Contact Number"
                  name="ins_contact"
                  value={formData.contactDetails.ins_contact}
                  onChange={(e) => handleChange(e, 'contactDetails')}
                  placeholder="Enter contact number"
                  type="tel"
                  required
                />
              </div>
            </section>

            {/* Department Info */}
            <section>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Department Information</h3>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Department<span className="text-red-500">*</span>
                </label>
                <select
                  name="ins_dept"
                  value={formData.department.ins_dept}
                  onChange={(e) => handleChange(e, 'department')}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="BSIT">BSIT</option>
                  <option value="BSIS">BSIS</option>
                  <option value="BSCS">BSCS</option>
                </select>
              </div>
              {formData.department.ins_dept && (
                <div className="mt-2 text-sm text-blue-600">
                  You can only select subjects from the {formData.department.ins_dept} department
                </div>
              )}
            </section>

            {/* Subject Load */}
            <section>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Subject Load</h3>
              
              {!formData.department.ins_dept && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                  Please select a department first to see available subjects.
                </div>
              )}

              {formData.department.ins_dept && availableSubjects.length === 0 && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                  No subjects available for the {formData.department.ins_dept} department.
                </div>
              )}

              {formData.subjectLoad.map((subject, index) => (
                <div key={index} className={`space-y-4 p-4 border-2 rounded-md mb-4 ${subject.isConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-600">Subject #{index + 1}</h4>
                    <div className="flex space-x-2">
                      {!subject.isConfirmed && (
                        <button
                          type="button"
                          onClick={() => confirmSubject(index)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Confirm
                        </button>
                      )}
                      {formData.subjectLoad.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSubject(index)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {subject.validationError && (
                    <p className="text-red-500 text-sm">{subject.validationError}</p>
                  )}

                  {subject.isConfirmed && (
                    <p className="text-green-600 text-sm">✓ Subject confirmed</p>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Subject Name<span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subjectName"
                        value={subject.subjectName}
                        onChange={(e) => handleChange(e, 'subjectLoad', index)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                        disabled={subject.isConfirmed || !formData.department.ins_dept}
                      >
                        <option value="">Select Subject</option>
                        {availableSubjectNames.map(subjectName => (
                          <option key={subjectName} value={subjectName}>
                            {subjectName}
                          </option>
                        ))}
                      </select>
                      {formData.department.ins_dept && (
                        <p className="text-xs text-gray-500 mt-1">
                          {availableSubjectNames.length} subjects available
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InputText
                        label="Course"
                        name="course"
                        value={subject.course}
                        readOnly
                      />
                      <InputText
                        label="Year"
                        name="year"
                        value={subject.year}
                        readOnly
                      />
                      <InputText
                        label="Semester"
                        name="semester"
                        value={subject.semester}
                        readOnly
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputText
                        label="MIS Code"
                        name="miscode"
                        value={subject.miscode}
                        readOnly
                      />
                      <InputText
                        label="Units"
                        name="units"
                        value={subject.units}
                        readOnly
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {formData.department.ins_dept && canAddMoreSubjects && (
                <button
                  type="button"
                  onClick={addSubject}
                  className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                >
                  Add Subject ({availableSubjectNames.length} available)
                </button>
              )}

              {formData.department.ins_dept && !canAddMoreSubjects && formData.subjectLoad.length > 0 && (
                <div className="text-center text-sm text-gray-500 p-2">
                  All available subjects have been added.
                </div>
              )}
            </section>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> 
                <ul className="list-disc list-inside mt-2">
                  <li>Select a department first to see available subjects</li>
                  <li>You can only choose subjects from the selected department</li>
                  <li>Each subject can only be added once</li>
                  <li>Click the "Confirm" button for each subject after selection</li>
                  <li>The submit button will only be enabled when all subjects are confirmed</li>
                </ul>
              </p>
            </div>

            <button
              type="submit"
              disabled={!allSubjectsConfirmed || isLoading || !currentModerator || !formData.department.ins_dept}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : `Confirm and Save ${allSubjectsConfirmed ? '✓' : ''}`}
            </button>
          </form>

          <div className="mt-8 text-center text-gray-400 text-sm">
            Note: This form is for instructor registration
          </div>
        </div>
      </div>

      {isLoading && <LoadingOverlay message="Submitting form... Creating instructor record..." />}
    </>
  );
};

export default InstructorForm;