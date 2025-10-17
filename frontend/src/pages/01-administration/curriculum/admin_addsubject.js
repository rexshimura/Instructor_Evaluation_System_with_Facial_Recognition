import React, { useState, useEffect } from "react";
import { FiSave, FiXCircle, FiPlus, FiInfo } from 'react-icons/fi';

// Defines the initial state for a new subject form
const NEW_SUBJECT_TEMPLATE = {
  sub_name: "",
  sub_semester: 1,
  sub_year: 1,
  sub_units: 3,
  sub_course: "BSIT",
};

export default function AddSubjectModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState(NEW_SUBJECT_TEMPLATE);
  const [hasChanged, setHasChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Effect to reset the form when the modal is closed and reopened.
  useEffect(() => {
    if (show) {
      setFormData(NEW_SUBJECT_TEMPLATE);
      setHasChanged(false);
      setErrors({});
      setTouched({});
      setLoading(false);
    }
  }, [show]);

  if (!show) return null;

  const handleClose = () => {
    if (hasChanged && !loading) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sub_name.trim()) {
      newErrors.sub_name = "Subject name is required";
    } else if (formData.sub_name.trim().length < 3) {
      newErrors.sub_name = "Subject name must be at least 3 characters long";
    }

    if (!formData.sub_year) {
      newErrors.sub_year = "Year is required";
    }

    if (!formData.sub_semester) {
      newErrors.sub_semester = "Semester is required";
    }

    if (!formData.sub_units) {
      newErrors.sub_units = "Units are required";
    } else if (formData.sub_units < 1 || formData.sub_units > 6) {
      newErrors.sub_units = "Units must be between 1 and 6";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseInt(value) || '' : value;
    
    setFormData(prev => ({
      ...prev, 
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setHasChanged(true);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate individual field on blur
    if (name === 'sub_name' && !formData.sub_name.trim()) {
      setErrors(prev => ({ ...prev, sub_name: "Subject name is required" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      sub_name: true,
      sub_year: true,
      sub_semester: true,
      sub_units: true,
      sub_course: true
    });
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const newSubject = {
        sub_name: formData.sub_name.trim(),
        sub_semester: parseInt(formData.sub_semester),
        sub_year: parseInt(formData.sub_year),
        sub_units: parseInt(formData.sub_units),
        sub_course: formData.sub_course,
      };

      await onSave(newSubject);
    } catch (error) {
      console.error("Error adding subject:", error);
      // Error is handled by the parent component
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if a field should show error
  const shouldShowError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiPlus className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add New Subject</h2>
              <p className="text-sm text-gray-600 mt-1">Create a new subject for the curriculum</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            disabled={loading}
          >
            <FiXCircle size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="sub_name" 
                value={formData.sub_name} 
                onChange={handleChange}
                onBlur={handleBlur}
                required 
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  shouldShowError('sub_name') 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="e.g., Introduction to Programming"
                disabled={loading}
              />
              {shouldShowError('sub_name') && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FiInfo size={14} />
                  {errors.sub_name}
                </p>
              )}
            </div>

            {/* Course and Academic Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select 
                  name="sub_course" 
                  value={formData.sub_course} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors"
                  disabled={loading}
                >
                  <option value="BSIT">BSIT</option>
                  <option value="BSIS">BSIS</option>
                  <option value="BSCS">BSCS</option>
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Level <span className="text-red-500">*</span>
                </label>
                <select 
                  name="sub_year" 
                  value={formData.sub_year} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    shouldShowError('sub_year') 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select Year</option>
                  {[1, 2, 3, 4].map(year => (
                    <option key={year} value={year}>
                      {year} {year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                    </option>
                  ))}
                </select>
                {shouldShowError('sub_year') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FiInfo size={14} />
                    {errors.sub_year}
                  </p>
                )}
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select 
                  name="sub_semester" 
                  value={formData.sub_semester} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    shouldShowError('sub_semester') 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select Semester</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                </select>
                {shouldShowError('sub_semester') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FiInfo size={14} />
                    {errors.sub_semester}
                  </p>
                )}
              </div>

              {/* Units */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units <span className="text-red-500">*</span>
                </label>
                <select 
                  name="sub_units" 
                  value={formData.sub_units} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    shouldShowError('sub_units') 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select Units</option>
                  {[1, 2, 3, 4, 5, 6].map(unit => (
                    <option key={unit} value={unit}>
                      {unit} {unit === 1 ? 'unit' : 'units'}
                    </option>
                  ))}
                </select>
                {shouldShowError('sub_units') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FiInfo size={14} />
                    {errors.sub_units}
                  </p>
                )}
              </div>
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">Automatic MIS Code Generation</p>
                  <p className="text-sm text-blue-700">
                    The MIS Code will be automatically generated by the system based on the course and subject ID after creation.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {hasChanged && !loading && "You have unsaved changes"}
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm"
            >
              <FiXCircle size={16} /> 
              Cancel
            </button>
            <button 
              type="submit" 
              onClick={handleSubmit}
              disabled={!hasChanged || loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Adding Subject...
                </>
              ) : (
                <>
                  <FiPlus size={16} /> 
                  Add Subject
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}