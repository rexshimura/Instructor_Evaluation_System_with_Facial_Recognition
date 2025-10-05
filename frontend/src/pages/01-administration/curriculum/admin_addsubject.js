import React, { useState, useEffect } from "react";
import { FiSave, FiXCircle, FiPlus } from 'react-icons/fi'; // Importing icons for better UI

// Defines the initial state for a new subject form
const NEW_SUBJECT_TEMPLATE = {
  sb_name: "",
  mis_prefix: "IT",
  mis_number: "",
  sb_semester: 1,
  sb_year: 1,
  sb_units: 3,
  sb_course: "BSIT",
};

// Maps courses to their valid MIS prefixes
const MIS_PREFIXES = {
    BSIT: ["IT", "GE", "PE"],
    BSIS: ["IS", "GE", "PE"],
};

export default function AddSubjectModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState(NEW_SUBJECT_TEMPLATE);
  // State to track if the user has interacted with the form.
  const [hasChanged, setHasChanged] = useState(false);

  // Effect to reset the form when the modal is closed and reopened.
  useEffect(() => {
    if (show) {
      setFormData(NEW_SUBJECT_TEMPLATE);
      setHasChanged(false);
    }
  }, [show]);

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
    setFormData(prev => {
        const newFormData = { ...prev, [name]: value };
        // When course changes, automatically update the prefix to the default
        if (name === 'sb_course') {
            newFormData.mis_prefix = MIS_PREFIXES[value][0];
        }
        return newFormData;
    });
    // A change has been detected, enabling the save button.
    setHasChanged(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSubject = {
        ...formData,
        sb_subID: Date.now().toString(), // Use a timestamp for a unique ID
        sb_miscode: `${formData.mis_prefix}${formData.mis_number}`,
    };
    // Clean up temporary fields before saving
    delete newSubject.mis_prefix;
    delete newSubject.mis_number;
    onSave(newSubject);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl m-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Subject</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <FiXCircle size={24} />
            </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Subject Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name <span className="text-red-500">*</span></label>
            <input type="text" name="sb_name" value={formData.sb_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>

          {/* Row 2: Course and MIS Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
              <select name="sb_course" value={formData.sb_course} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="BSIT">BSIT</option>
                <option value="BSIS">BSIS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MIS Prefix <span className="text-red-500">*</span></label>
              <select name="mis_prefix" value={formData.mis_prefix} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                {MIS_PREFIXES[formData.sb_course].map(prefix => <option key={prefix} value={prefix}>{prefix}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MIS Number <span className="text-red-500">*</span></label>
              <input type="number" name="mis_number" value={formData.mis_number} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>

          {/* Row 3: Academic Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
              <input type="number" name="sb_year" min="1" max="4" value={formData.sb_year} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester <span className="text-red-500">*</span></label>
              <input type="number" name="sb_semester" min="1" max="2" value={formData.sb_semester} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
              <input type="number" name="sb_units" min="1" max="6" value={formData.sb_units} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
            <button type="button" onClick={handleClose} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-semibold">
                <FiXCircle/> Cancel
            </button>
            <button type="submit" disabled={!hasChanged} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">
                <FiPlus/> Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

