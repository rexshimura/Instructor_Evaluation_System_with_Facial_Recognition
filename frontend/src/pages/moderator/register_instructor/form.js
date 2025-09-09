import React, { useState } from 'react';
import ModeratorFormNavBar from "../../../components/module_layout/Moderator-FormNavbar";

// InputText component from your module
const InputText = ({ label, value, onChange, placeholder, type = "text", required, name }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
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

// InputDateOfBirth component from your module
const InputDateOfBirth = ({ value, onChange, required, name }) => {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const maxDate = today.toISOString().split("T")[0];

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">
        Date of Birth
        {required && <span className="text-red-500">*</span>}
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

const App = () => {
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
      // Clear validation error on change
      newSubjectLoad[index].validationError = '';
      setFormData({ ...formData,
        subjectLoad: newSubjectLoad
      });
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
    setFormData({ ...formData,
      subjectLoad: newSubjectLoad
    });
  };

  const confirmSubject = (index) => {
    const subject = formData.subjectLoad[index];
    const newSubjectLoad = [...formData.subjectLoad];
    if (!subject.subjectName || !subject.miscode || !subject.units || !subject.semester || !subject.year) {
      newSubjectLoad[index].validationError = "Please fill in all required fields for this subject before confirming.";
      setFormData({ ...formData,
        subjectLoad: newSubjectLoad
      });
      return;
    }

    newSubjectLoad[index].isConfirmed = true;
    newSubjectLoad[index].validationError = ''; // Clear error on successful confirmation
    setFormData({ ...formData,
      subjectLoad: newSubjectLoad
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    // Navigate to the test page as requested
    window.location.href = '/test';
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
              <InputText
                label="First Name"
                value={formData.personalInfo.fname}
                onChange={(e) => handleChange(e, 'personalInfo')}
                placeholder="Enter first name"
                name="fname"
                required={true}
              />
              <InputText
                label="Middle Name"
                value={formData.personalInfo.mname}
                onChange={(e) => handleChange(e, 'personalInfo')}
                placeholder="Enter middle name"
                name="mname"
                required={true}
              />
              <InputText
                label="Last Name"
                value={formData.personalInfo.lname}
                onChange={(e) => handleChange(e, 'personalInfo')}
                placeholder="Enter last name"
                name="lname"
                required={true}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <InputText
                label="Suffix"
                value={formData.personalInfo.suffix}
                onChange={(e) => handleChange(e, 'personalInfo')}
                placeholder="e.g., Jr., Sr."
                name="suffix"
              />
              <InputDateOfBirth
                value={formData.personalInfo.dob}
                onChange={(e) => handleChange(e, 'personalInfo')}
                name="dob"
                required={true}
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
                  <option value="other">Other</option>
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
                value={formData.contactDetails.email}
                onChange={(e) => handleChange(e, 'contactDetails')}
                placeholder="Enter email"
                type="email"
                name="email"
                required={true}
              />
              <InputText
                label="Contact Number"
                value={formData.contactDetails.contactnum}
                onChange={(e) => handleChange(e, 'contactDetails')}
                placeholder="Enter contact number"
                type="tel"
                name="contactnum"
                required={true}
              />
            </div>
          </section>

          {/* Subject Load */}
          <section>
            <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Subject Load</h3>
            {formData.subjectLoad.map((subject, index) => (
              <div
                key={index}
                className={`space-y-4 p-4 border-2 rounded-md mb-4 ${subject.isConfirmed ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-600">Subject #{index + 1}</h4>
                  <div className="flex space-x-2">
                    {!subject.isConfirmed && (
                      <button
                        type="button"
                        onClick={() => confirmSubject(index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Confirm
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {subject.validationError && (
                  <p className="text-red-500 text-sm">{subject.validationError}</p>
                )}
                <div className="grid grid-cols-1 gap-4">
                  <InputText
                    label="Subject Name"
                    value={subject.subjectName}
                    onChange={(e) => handleChange(e, 'subjectLoad', index)}
                    name="subjectName"
                    required={true}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputText
                    label="MIS Code"
                    value={subject.miscode}
                    onChange={(e) => handleChange(e, 'subjectLoad', index)}
                    name="miscode"
                    required={true}
                  />
                  <InputText
                    label="Units"
                    value={subject.units}
                    onChange={(e) => handleChange(e, 'subjectLoad', index)}
                    name="units"
                    required={true}
                    type="number"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Semester<span className="text-red-500">*</span>
                    </label>
                    <select
                      id={`semester-${index}`}
                      name="semester"
                      value={subject.semester}
                      onChange={(e) => handleChange(e, 'subjectLoad', index)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select Semester</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Year<span className="text-red-500">*</span>
                    </label>
                    <select
                      id={`year-${index}`}
                      name="year"
                      value={subject.year}
                      onChange={(e) => handleChange(e, 'subjectLoad', index)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
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
            <button
              type="button"
              onClick={addSubject}
              className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Subject
            </button>
          </section>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            disabled={!allSubjectsConfirmed}
          >
            Confirm and Next
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default App;
