import React, { useState, useEffect } from 'react';
import { FiSave, FiXCircle, FiInfo, FiEdit3 } from 'react-icons/fi';

export default function EditSubjectModal({ show, onClose, subject, onSave }) {
  const [formData, setFormData] = useState(null);
  const [hasChanged, setHasChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // This effect populates the form when the 'subject' prop changes.
  useEffect(() => {
    if (subject) {
      setFormData({ 
        ...subject,
        sub_units: subject.sub_units || 3 // Default to 3 if null
      });
      setHasChanged(false);
      setErrors({});
      setTouched({});
    }
  }, [subject]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  };

  const handleClose = () => {
    if (hasChanged && !loading) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sub_name?.trim()) {
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
    if (!hasChanged) return;

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
      const updatedSubject = {
        sub_id: formData.sub_id, // Keep the original ID
        sub_name: formData.sub_name.trim(),
        sub_semester: parseInt(formData.sub_semester),
        sub_year: parseInt(formData.sub_year),
        sub_units: parseInt(formData.sub_units),
        sub_course: formData.sub_course,
      };
      
      await onSave(updatedSubject);
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if a field should show error
  const shouldShowError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  // Display a loading state while the subject data is being prepared.
  if (!formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 text-center">Loading subject details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FiEdit3 className="text-indigo-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Edit Subject Details</h2>
              <p className="text-sm text-gray-600 mt-1">Update subject information</p>
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
            {/* Subject ID and Name Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject ID</label>
                <input 
                  type="text" 
                  value={formData.sub_id || ''} 
                  disabled 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-mono" 
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="sub_name" 
                  value={formData.sub_name || ''} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    shouldShowError('sub_name') 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter subject name"
                  disabled={loading}
                />
                {shouldShowError('sub_name') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FiInfo size={14} />
                    {errors.sub_name}
                  </p>
                )}
              </div>
            </div>

            {/* Course, MIS Code, and Units Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <select 
                  name="sub_course" 
                  value={formData.sub_course || 'BSIT'} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors"
                  disabled={loading}
                >
                  <option value="BSIT">BSIT</option>
                  <option value="BSIS">BSIS</option>
                  <option value="BSCS">BSCS</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MIS Code</label>
                <input 
                  type="text" 
                  value={formData.sub_miscode || 'N/A'} 
                  disabled 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed font-mono" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units <span className="text-red-500">*</span>
                </label>
                <select 
                  name="sub_units" 
                  value={formData.sub_units || ''} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
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

            {/* Year and Semester Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Level <span className="text-red-500">*</span>
                </label>
                <select 
                  name="sub_year" 
                  value={formData.sub_year || ''} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select 
                  name="sub_semester" 
                  value={formData.sub_semester || ''} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required 
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
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
            </div>

            {/* Information Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">System-Generated MIS Code</p>
                  <p className="text-sm text-blue-700">
                    The MIS Code is automatically generated by the system and cannot be manually edited. 
                    It's based on the course and subject ID.
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
            {!hasChanged && !loading && "No changes made"}
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
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  <FiSave size={16} /> 
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}