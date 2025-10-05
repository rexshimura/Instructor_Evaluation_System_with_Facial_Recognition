import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner, FaExclamationTriangle } from "react-icons/fa";

export default function EditModerator({ isOpen, onClose, onSubmit, isLoading, moderatorData }) {
  const initialFormState = {
    mod_fname: "",
    mod_mname: "",
    mod_lname: "",
    mod_username: "",
    mod_password: "", // Password will be optional
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isOpen && moderatorData) {
      // Pre-populate the form with the moderator's existing data
      setFormData({
        mod_fname: moderatorData.mod_fname || "",
        mod_mname: moderatorData.mod_mname || "",
        mod_lname: moderatorData.mod_lname || "",
        mod_username: moderatorData.mod_username || "",
        mod_password: "", // Keep password field blank for security
      });
      setErrors({});
      setApiError("");
    } else if (!isOpen) {
      setFormData(initialFormState);
      setApiError("");
    }
  }, [isOpen, moderatorData]);

  const handleClose = () => {
    setApiError("");
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    if (apiError) {
      setApiError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.mod_fname.trim()) newErrors.mod_fname = "First name is required.";
    if (!formData.mod_lname.trim()) newErrors.mod_lname = "Last name is required.";
    if (!formData.mod_username.trim()) newErrors.mod_username = "Username is required.";
    if (formData.mod_username.length < 4) newErrors.mod_username = "Username must be at least 4 characters.";

    // Only validate the password if a new one is entered
    if (formData.mod_password && formData.mod_password.length < 6) {
      newErrors.mod_password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const dataToSubmit = { ...formData };
        
        // Remove password field if it's empty (so backend keeps current password)
        if (!dataToSubmit.mod_password.trim()) {
          delete dataToSubmit.mod_password;
        }
        
        // Use mod_id from moderatorData (backend field name)
        await onSubmit(moderatorData.mod_id, dataToSubmit);
      } catch (error) {
        setApiError(error.message || "Failed to update moderator");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full m-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Moderator Account</h2>
          <button 
            onClick={handleClose} 
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:text-gray-300 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Display who is being edited */}
        <div className="text-center mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-700">You are editing the account for:</p>
          <p className="font-bold text-purple-700 text-lg">
            {moderatorData ? `${moderatorData.mod_lname}, ${moderatorData.mod_fname}` : "Loading..."}
          </p>
          <p className="text-xs text-gray-500 mt-1">ID: {moderatorData?.mod_id}</p>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="mod_username" className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="mod_username" 
                id="mod_username" 
                value={formData.mod_username} 
                onChange={handleChange} 
                disabled={true}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                title="Username cannot be changed"
              />
              <p className="text-gray-500 text-xs mt-1">Username cannot be changed</p>
            </div>
            
            <div>
              <label htmlFor="mod_fname" className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="mod_fname" 
                id="mod_fname" 
                value={formData.mod_fname} 
                onChange={handleChange} 
                className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.mod_fname ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter first name"
              />
              {errors.mod_fname && <p className="text-red-500 text-xs mt-1">{errors.mod_fname}</p>}
            </div>
            
            <div>
              <label htmlFor="mod_mname" className="block text-sm font-medium text-gray-700">
                Middle Name (Optional)
              </label>
              <input 
                type="text" 
                name="mod_mname" 
                id="mod_mname" 
                value={formData.mod_mname} 
                onChange={handleChange} 
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter middle name"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="mod_lname" className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="mod_lname" 
                id="mod_lname" 
                value={formData.mod_lname} 
                onChange={handleChange} 
                className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.mod_lname ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter last name"
              />
              {errors.mod_lname && <p className="text-red-500 text-xs mt-1">{errors.mod_lname}</p>}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="mod_password" className="block text-sm font-medium text-gray-700">
                New Password
                <span className="text-gray-500 text-xs ml-1 font-normal">
                  (Leave blank to keep current password)
                </span>
              </label>
              <input 
                type="password" 
                name="mod_password" 
                id="mod_password" 
                placeholder="Enter new password to change"
                value={formData.mod_password} 
                onChange={handleChange} 
                className={`mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.mod_password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.mod_password && <p className="text-red-500 text-xs mt-1">{errors.mod_password}</p>}
              <p className="text-gray-500 text-xs mt-1">Minimum 6 characters if changing password</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && <FaSpinner className="animate-spin" />}
              Update Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}