import React, { useState, useEffect } from 'react';
import { FiSave, FiXCircle } from 'react-icons/fi'; // Importing icons for better UI

// Maps courses to their valid MIS prefixes
const MIS_PREFIXES = {
  BSIT: ['IT', 'GE', 'PE'],
  BSIS: ['IS', 'GE', 'PE'],
};

export default function EditSubjectModal({ show, onClose, subject, onSave }) {
  // Initialize formData to null to prevent rendering with stale data.
  const [formData, setFormData] = useState(null);
  // State to track if any changes have been made to the form.
  const [hasChanged, setHasChanged] = useState(false);

  // This effect populates the form when the 'subject' prop changes.
  useEffect(() => {
    if (subject) {
      // Deconstruct the MIS code into prefix and number for the form fields.
      const prefix = subject.sb_miscode.replace(/[0-9]/g, '');
      const number = subject.sb_miscode.replace(/[^0-9]/g, '');
      setFormData({ ...subject, mis_prefix: prefix, mis_number: number });
      // Reset the changed state whenever a new subject is loaded.
      setHasChanged(false);
    }
  }, [subject]);

  if (!show) return null;

  const handleClose = () => {
    // If changes have been made, ask for confirmation before closing.
    if (hasChanged) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // A change has been detected, so we enable the save button.
    setHasChanged(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only proceed if there are changes to save.
    if (!hasChanged) return;

    const updatedSubject = {
        ...formData,
        // Reconstruct the MIS code from the form fields before saving.
        sb_miscode: `${formData.mis_prefix}${formData.mis_number}`,
    };
    // Clean up temporary form-only fields.
    delete updatedSubject.mis_prefix;
    delete updatedSubject.mis_number;
    onSave(updatedSubject);
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
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <FiXCircle size={24} />
            </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Subject Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject ID</label>
              <input type="text" value={formData.sb_subID || ''} disabled className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name <span className="text-red-500">*</span></label>
              <input type="text" name="sb_name" value={formData.sb_name || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>

          {/* Row 2: Course and MIS Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
              <select name="sb_course" value={formData.sb_course || 'BSIT'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="BSIT">BSIT</option>
                <option value="BSIS">BSIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MIS Prefix <span className="text-red-500">*</span></label>
              <select name="mis_prefix" value={formData.mis_prefix || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                 {MIS_PREFIXES[formData.sb_course || 'BSIT'].map(prefix => <option key={prefix} value={prefix}>{prefix}</option>)}
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MIS Number <span className="text-red-500">*</span></label>
              <input type="number" name="mis_number" value={formData.mis_number || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>

          {/* Row 3: Academic Details */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
              <input type="number" name="sb_year" min="1" max="4" value={formData.sb_year || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester <span className="text-red-500">*</span></label>
              <input type="number" name="sb_semester" min="1" max="2" value={formData.sb_semester || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
              <input type="number" name="sb_units" min="1" max="6" value={formData.sb_units || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
            <button type="button" onClick={handleClose} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-semibold">
                <FiXCircle/> Cancel
            </button>
            <button type="submit" disabled={!hasChanged} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">
                <FiSave/> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

