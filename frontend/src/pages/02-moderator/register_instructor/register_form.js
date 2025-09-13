import React, { useState } from 'react';
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
const InputText = ({ label, value, onChange, placeholder, type = "text", required, name }) => {
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
        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
        required={required}
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

// Courses array for dropdown
const availableCourses = ["BSIT", "BSCpE", "BSCS", "BSIS"];

const InstructorForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleChange = (e, fieldSet, index) => {
    const { name, value } = e.target;
    if (fieldSet === 'subjectLoad') {
      const newSubjectLoad = [...formData.subjectLoad];
      newSubjectLoad[index][name] = value;
      newSubjectLoad[index].validationError = '';
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
    const newSubjectLoad = formData.subjectLoad.filter((_, i) => i !== index);
    setFormData({ ...formData, subjectLoad: newSubjectLoad });
  };

  const confirmSubject = (index) => {
    const subject = formData.subjectLoad[index];
    const newSubjectLoad = [...formData.subjectLoad];
    if (!subject.subjectName || !subject.miscode || !subject.units || !subject.semester || !subject.year || !subject.course) {
      newSubjectLoad[index].validationError = "Please fill in all required fields for this subject before confirming.";
      setFormData({ ...formData, subjectLoad: newSubjectLoad });
      return;
    }
    newSubjectLoad[index].isConfirmed = true;
    newSubjectLoad[index].validationError = '';
    setFormData({ ...formData, subjectLoad: newSubjectLoad });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allSubjectsConfirmed = formData.subjectLoad.every(sub => sub.isConfirmed);
    if (!allSubjectsConfirmed) {
      alert("Please confirm all subjects before proceeding.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      console.log('Form data submitted:', formData);
      navigate("/mod-panel");
    }, 1000);
  };

  const allSubjectsConfirmed = formData.subjectLoad.every(subject => subject.isConfirmed);

  return (
    <>
      <ModeratorFormNavBar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Registration Form</h2>
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Personal Info */}
            <section>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputText label="First Name" name="fname" value={formData.personalInfo.fname} onChange={(e) => handleChange(e, 'personalInfo')} placeholder="Enter first name" required />
                <InputText label="Middle Name" name="mname" value={formData.personalInfo.mname} onChange={(e) => handleChange(e, 'personalInfo')} placeholder="Enter middle name" required />
                <InputText label="Last Name" name="lname" value={formData.personalInfo.lname} onChange={(e) => handleChange(e, 'personalInfo')} placeholder="Enter last name" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <InputText label="Suffix" name="suffix" value={formData.personalInfo.suffix} onChange={(e) => handleChange(e, 'personalInfo')} placeholder="e.g., Jr., Sr." />
                <InputDateOfBirth name="dob" value={formData.personalInfo.dob} onChange={(e) => handleChange(e, 'personalInfo')} required />
                <div>
                  <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex<span className="text-red-500">*</span></label>
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
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Contact Details */}
            <section>
              <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputText label="Email Address" name="email" value={formData.contactDetails.email} onChange={(e) => handleChange(e, 'contactDetails')} placeholder="Enter email" type="email" required />
                <InputText label="Contact Number" name="contactnum" value={formData.contactDetails.contactnum} onChange={(e) => handleChange(e, 'contactDetails')} placeholder="Enter contact number" type="tel" required />
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
                      {!subject.isConfirmed && <button type="button" onClick={() => confirmSubject(index)} className="text-green-600 hover:text-green-800">Confirm</button>}
                      <button type="button" onClick={() => removeSubject(index)} className="text-red-600 hover:text-red-800">Remove</button>
                    </div>
                  </div>
                  {subject.validationError && <p className="text-red-500 text-sm">{subject.validationError}</p>}

                  {/* Subject Name and Course Dropdown */}
                  <div className="grid grid-cols-1 gap-4">
                    <InputText
                      label="Subject Name"
                      name="subjectName"
                      value={subject.subjectName}
                      onChange={(e) => handleChange(e, 'subjectLoad', index)}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">Subject Course<span className="text-red-500">*</span></label>
                      <select
                        name="course"
                        value={subject.course || ""}
                        onChange={(e) => handleChange(e, 'subjectLoad', index)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Select Course</option>
                        {availableCourses.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* MIS Code and Units */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputText label="MIS Code" name="miscode" value={subject.miscode} onChange={(e) => handleChange(e, 'subjectLoad', index)} required />
                    <InputText label="Units" name="units" value={subject.units} onChange={(e) => handleChange(e, 'subjectLoad', index)} required type="number" />
                  </div>

                  {/* Semester and Year */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Semester<span className="text-red-500">*</span></label>
                      <select name="semester" value={subject.semester} onChange={(e) => handleChange(e, 'subjectLoad', index)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                        <option value="">Select Semester</option>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                        <option value="Summer">Summer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Year<span className="text-red-500">*</span></label>
                      <select name="year" value={subject.year} onChange={(e) => handleChange(e, 'subjectLoad', index)} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                        <option value="">Select Year</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSubject} className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50">Add Subject</button>
            </section>

            <button type="submit" disabled={!allSubjectsConfirmed} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
              Confirm and Save
            </button>
          </form>
        </div>
      </div>

      {isLoading && <LoadingOverlay message="Submitting form... Preparing facial registration..." />}
    </>
  );
};

export default InstructorForm;
