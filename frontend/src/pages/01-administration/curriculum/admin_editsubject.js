import React, { useState, useEffect } from 'react';
import { FiSave, FiXCircle } from 'react-icons/fi';

// Maps courses to their valid MIS prefixes
const MIS_PREFIXES = {
  BSIT: ['IT', 'GE', 'PE'],
  BSIS: ['IS', 'GE', 'PE'],
};

export default function EditSubjectModal({ show, onClose, subject, onSave }) {
  const [formData, setFormData] = useState(null);
  const [hasChanged, setHasChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // This effect populates the form when the 'subject' prop changes.
  useEffect(() => {
    if (subject) {
      // Deconstruct the MIS code into prefix and number for the form fields.
      const prefix = subject.sb_miscode.replace(/[0-9]/g, '');
      const number = subject.sb_miscode.replace(/[^0-9]/g, '');
      setFormData({ 
        ...subject, 
        mis_prefix: prefix, 
        mis_number: number,
        sb_units: subject.sb_units || 3 // Default to 3 if null
      });
      setHasChanged(false);
      setErrors({});
    }
  }, [subject]);

  if (!show) return null;

  const handleClose = () => {
    if (hasChanged) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.sb_name?.trim()) {
      newErrors.sb_name = "Subject name is required";
    }

    if (!formData.mis_number) {
      newErrors.mis_number = "MIS number is required";
    } else if (formData.mis_number < 1) {
      newErrors.mis_number = "MIS number must be positive";
    }

    if (!formData.sb_year) {
      newErrors.sb_year = "Year is required";
    }

    if (!formData.sb_semester) {
      newErrors.sb_semester = "Semester is required";
    }

    if (!formData.sb_units) {
      newErrors.sb_units = "Units are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setHasChanged(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanged) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const updatedSubject = {
        sb_subid: formData.sb_subid, // Keep the original ID
        sb_name: formData.sb_name.trim(),
        sb_miscode: `${formData.mis_prefix}${formData.mis_number}`,
        sb_semester: parseInt(formData.sb_semester),
        sb_year: parseInt(formData.sb_year),
        sb_units: parseInt(formData.sb_units), // Always parse to integer, never null
        sb_course: formData.sb_course,
      };
      
      await onSave(updatedSubject);
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setLoading(false);
    }
  };

  // Display a loading state while the subject data is being prepared.
  if (!formData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <p className="text-center text-gray-600 animate-pulse">Loading subject details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl m-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Edit Subject Details</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
                <FiXCircle size={24} />
            </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Subject Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject ID</label>
              <input 
                type="text" 
                value={formData.sb_subid || ''} 
                disabled 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="sb_name" 
                value={formData.sb_name || ''} 
                onChange={handleChange} 
                required 
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.sb_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.sb_name && (
                <p className="mt-1 text-sm text-red-600">{errors.sb_name}</p>
              )}
            </div>
          </div>

          {/* Row 2: Course and MIS Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course <span className="text-red-500">*</span>
              </label>
              <select 
                name="sb_course" 
                value={formData.sb_course || 'BSIT'} 
                onChange={handleChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="BSIT">BSIT</option>
                <option value="BSIS">BSIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MIS Prefix <span className="text-red-500">*</span>
              </label>
              <select 
                name="mis_prefix" 
                value={formData.mis_prefix || ''} 
                onChange={handleChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {MIS_PREFIXES[formData.sb_course || 'BSIT'].map(prefix => (
                  <option key={prefix} value={prefix}>{prefix}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MIS Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                name="mis_number" 
                value={formData.mis_number || ''} 
                onChange={handleChange} 
                required 
                min="1"
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.mis_number ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.mis_number && (
                <p className="mt-1 text-sm text-red-600">{errors.mis_number}</p>
              )}
            </div>
          </div>

          {/* Row 3: Academic Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <select 
                name="sb_year" 
                value={formData.sb_year || ''} 
                onChange={handleChange} 
                required 
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.sb_year ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Year</option>
                {[1, 2, 3, 4].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              {errors.sb_year && (
                <p className="mt-1 text-sm text-red-600">{errors.sb_year}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              <select 
                name="sb_semester" 
                value={formData.sb_semester || ''} 
                onChange={handleChange} 
                required 
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.sb_semester ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Semester</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
              </select>
              {errors.sb_semester && (
                <p className="mt-1 text-sm text-red-600">{errors.sb_semester}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Units <span className="text-red-500">*</span>
              </label>
              <select 
                name="sb_units" 
                value={formData.sb_units || ''} 
                onChange={handleChange} 
                required
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.sb_units ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Units</option>
                {[1, 2, 3, 6].map(unit => (
                  <option key={unit} value={unit}>{unit} {unit === 1 ? 'unit' : 'units'}</option>
                ))}
              </select>
              {errors.sb_units && (
                <p className="mt-1 text-sm text-red-600">{errors.sb_units}</p>
              )}
            </div>
          </div>

          {/* Preview of MIS Code */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Preview:</strong> MIS Code will be:{" "}
              <span className="font-mono font-bold">
                {formData.mis_prefix}{formData.mis_number || 'XXX'}
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-semibold disabled:bg-gray-100 disabled:text-gray-400"
            >
              <FiXCircle/> Cancel
            </button>
            <button 
              type="submit" 
              disabled={!hasChanged || loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave/> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}