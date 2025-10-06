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

// API base URL
const API_BASE = "http://localhost:5000";

const InstructorForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [currentModerator, setCurrentModerator] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  const [formData, setFormData] = useState({
    personalInfo: {
      fname: '',
      mname: '',
      lname: '',
      suffix: '',
      dob: '',
      sex: '',
    },
    contactDetails: {
      email: '',
      contactnum: '',
    },
    subjectLoad: [
      {
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
        const response = await fetch(`${API_BASE}/subject_list`);
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

    // Get current moderator from sessionStorage - FIXED: using sessionStorage instead of localStorage
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

   const handleChange = (e, fieldSet, index) => {
    const { name, value } = e.target;
    
    if (fieldSet === 'subjectLoad') {
      const newSubjectLoad = [...formData.subjectLoad];
      newSubjectLoad[index][name] = value;
      
      // Reset confirmation when any field changes
      newSubjectLoad[index].isConfirmed = false;
      newSubjectLoad[index].validationError = '';
      
      if (name === 'subjectName' || name === 'course' || name === 'year' || name === 'semester') {
        const selectedSubject = subjects.find(
          (subject) =>
            subject.sb_name === newSubjectLoad[index].subjectName &&
            subject.sb_course === newSubjectLoad[index].course &&
            subject.sb_year === parseInt(newSubjectLoad[index].year, 10) &&
            subject.sb_semester === parseInt(newSubjectLoad[index].semester, 10)
        );
        
        if (selectedSubject) {
          newSubjectLoad[index].subjectId = selectedSubject.sb_subid; // Store subject ID
          newSubjectLoad[index].miscode = selectedSubject.sb_miscode;
          newSubjectLoad[index].units = selectedSubject.sb_units.toString();
        } else {
          newSubjectLoad[index].subjectId = '';
          newSubjectLoad[index].miscode = '';
          newSubjectLoad[index].units = '';
        }
      }
      setFormData({ ...formData, subjectLoad: newSubjectLoad });
    } else {
      setFormData(prevData => ({
        ...prevData,
        [fieldSet]: {
          ...prevData[fieldSet],
          [name]: value,
        },
      }));
    }
  };

 const addSubject = () => {
    setFormData(prevData => ({
      ...prevData,
      subjectLoad: [
        ...prevData.subjectLoad,
        {
          subjectId: '', // Add subjectId field
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
  };

  const removeSubject = (index) => {
    if (formData.subjectLoad.length === 1) {
      setError("At least one subject is required.");
      return;
    }
    const newSubjectLoad = formData.subjectLoad.filter((_, i) => i !== index);
    setFormData({ ...formData, subjectLoad: newSubjectLoad });
  };

  const confirmSubject = (index) => {
    const subject = formData.subjectLoad[index];
    const newSubjectLoad = [...formData.subjectLoad];

    // Check if all required fields are filled
    if (!subject.subjectName || !subject.course || !subject.year || !subject.semester || !subject.miscode) {
      newSubjectLoad[index].validationError = "Please select a course, year, semester, and subject before confirming.";
      setFormData({ ...formData, subjectLoad: newSubjectLoad });
      return;
    }

    newSubjectLoad[index].isConfirmed = true;
    newSubjectLoad[index].validationError = '';
    setFormData({ ...formData, subjectLoad: newSubjectLoad });

    // Clear any previous errors
    setError('');
  };

  // Debug function to check subject status
  const checkSubjects = () => {
    const status = formData.subjectLoad.map((subject, index) => ({
      index,
      isConfirmed: subject.isConfirmed,
      subjectName: subject.subjectName,
      course: subject.course,
      year: subject.year,
      semester: subject.semester,
      miscode: subject.miscode
    }));
    setDebugInfo(JSON.stringify(status, null, 2));
    console.log('Subject Status:', status);
    console.log('All Confirmed:', formData.subjectLoad.every(sub => sub.isConfirmed));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allSubjectsConfirmed = formData.subjectLoad.every(sub => sub.isConfirmed);
    
    if (!allSubjectsConfirmed) {
      setError("Please confirm all subjects before proceeding. Click the 'Confirm' button for each subject.");
      return;
    }

    if (!currentModerator) {
      setError("Moderator information not found. Please log in again.");
      return;
    }

    // Check if all personal info is filled
    if (!formData.personalInfo.fname || !formData.personalInfo.lname || !formData.personalInfo.dob || !formData.personalInfo.sex) {
      setError("Please fill in all required personal information fields.");
      return;
    }

    // Check if all contact details are filled
    if (!formData.contactDetails.email || !formData.contactDetails.contactnum) {
      setError("Please fill in all required contact details.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Map sex to single character (M/F)
      const sexMap = {
        'male': 'M',
        'female': 'F'
      };

      // Prepare instructor data for API - Use subject IDs instead of MIS codes
      const instructorData = {
        in_fname: formData.personalInfo.fname,
        in_mname: formData.personalInfo.mname || '',
        in_lname: formData.personalInfo.lname,
        in_suffix: formData.personalInfo.suffix || '',
        in_dob: formData.personalInfo.dob,
        in_sex: sexMap[formData.personalInfo.sex] || 'M',
        in_email: formData.contactDetails.email,
        in_cnum: formData.contactDetails.contactnum,
        in_dept: formData.subjectLoad[0]?.course || 'BSIT',
        in_subhandled: formData.subjectLoad.map(subject => subject.subjectId).filter(Boolean), // Use subjectId instead of miscode
        moderator_id: currentModerator.mod_id
      };

      console.log('Submitting data to backend:', instructorData);

      const response = await fetch(`${API_BASE}/instructors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(instructorData),
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { error: responseText };
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = JSON.parse(responseText);
      console.log('Instructor created successfully:', result);
      
      // Navigate to moderator panel after successful submission
      navigate("/mod-panel");
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique courses from subjects
  const availableCourses = [...new Set(subjects.map(subject => subject.sb_course))].filter(Boolean);

  // Filter subjects based on selected course, year, and semester
  const getFilteredSubjects = (subjectLoadItem) => {
    if (!subjectLoadItem.course || !subjectLoadItem.year || !subjectLoadItem.semester) {
      return [];
    }

    return subjects.filter(
      subject =>
        subject.sb_course === subjectLoadItem.course &&
        subject.sb_year === parseInt(subjectLoadItem.year, 10) &&
        subject.sb_semester === parseInt(subjectLoadItem.semester, 10)
    );
  };

  const allSubjectsConfirmed = formData.subjectLoad.every(subject => subject.isConfirmed);

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
                  name="fname"
                  value={formData.personalInfo.fname}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  placeholder="Enter first name"
                  required
                />
                <InputText
                  label="Middle Name"
                  name="mname"
                  value={formData.personalInfo.mname}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  placeholder="Enter middle name"
                />
                <InputText
                  label="Last Name"
                  name="lname"
                  value={formData.personalInfo.lname}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <InputText
                  label="Suffix"
                  name="suffix"
                  value={formData.personalInfo.suffix}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  placeholder="e.g., Jr., Sr."
                />
                <InputDateOfBirth
                  name="dob"
                  value={formData.personalInfo.dob}
                  onChange={(e) => handleChange(e, 'personalInfo')}
                  required
                />
                <div>
                  <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
                    Sex<span className="text-red-500">*</span>
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.personalInfo.sex}
                    onChange={(e) => handleChange(e, 'personalInfo')}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    {/* Remove "other" option since database only accepts M/F */}
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
                  name="email"
                  value={formData.contactDetails.email}
                  onChange={(e) => handleChange(e, 'contactDetails')}
                  placeholder="Enter email"
                  type="email"
                  required
                />
                <InputText
                  label="Contact Number"
                  name="contactnum"
                  value={formData.contactDetails.contactnum}
                  onChange={(e) => handleChange(e, 'contactDetails')}
                  placeholder="Enter contact number"
                  type="tel"
                  required
                />
              </div>
            </section>

            {/* Subject Load */}
            <section>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Subject Load</h3>
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

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Course<span className="text-red-500">*</span>
                      </label>
                      <select
                        name="course"
                        value={subject.course || ""}
                        onChange={(e) => handleChange(e, 'subjectLoad', index)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                        disabled={subject.isConfirmed}
                      >
                        <option value="">Select Course</option>
                        {availableCourses.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Year<span className="text-red-500">*</span>
                        </label>
                        <select
                          name="year"
                          value={subject.year || ""}
                          onChange={(e) => handleChange(e, 'subjectLoad', index)}
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                          disabled={!subject.course || subject.isConfirmed}
                        >
                          <option value="">Select Year</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Semester<span className="text-red-500">*</span>
                        </label>
                        <select
                          name="semester"
                          value={subject.semester || ""}
                          onChange={(e) => handleChange(e, 'subjectLoad', index)}
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                          disabled={!subject.course || !subject.year || subject.isConfirmed}
                        >
                          <option value="">Select Semester</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                        </select>
                      </div>
                    </div>
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
                        disabled={!subject.course || !subject.year || !subject.semester || subject.isConfirmed}
                      >
                        <option value="">Select Subject</option>
                        {getFilteredSubjects(subject).map(s => (
                          <option key={s.sb_subid} value={s.sb_name}>
                            {s.sb_name}
                          </option>
                        ))}
                      </select>
                    </div>
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
              ))}
              <button
                type="button"
                onClick={addSubject}
                className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
              >
                Add Subject
              </button>
            </section>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Make sure to click the "Confirm" button for each subject after selecting all fields.
                The submit button will only be enabled when all subjects are confirmed.
              </p>
            </div>

            <button
              type="submit"
              disabled={!allSubjectsConfirmed || isLoading || !currentModerator}
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