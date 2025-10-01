import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner } from "react-icons/fa";

export default function CreateModerator({ isOpen, onClose, onSubmit, isLoading }) {
  const initialFormState = {
    mod_fname: "",
    mod_mname: "",
    mod_lname: "",
    mod_username: "",
    mod_password: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Reset form when modal is closed
    if (!isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  const handleClose = () => {
    // Directly close without a confirm dialog, as it may not work in an iframe.
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.mod_fname.trim()) newErrors.mod_fname = "First name is required.";
    if (!formData.mod_lname.trim()) newErrors.mod_lname = "Last name is required.";
    if (!formData.mod_username.trim()) newErrors.mod_username = "Username is required.";
    if (formData.mod_username.length < 4) newErrors.mod_username = "Username must be at least 4 characters.";
    if (!formData.mod_password) newErrors.mod_password = "Password is required.";
    if (formData.mod_password.length < 6) newErrors.mod_password = "Password must be at least 6 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full m-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create Moderator Account</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="mod_username" className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input type="text" name="mod_username" id="mod_username" value={formData.mod_username} onChange={handleChange} className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${errors.mod_username ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.mod_username && <p className="text-red-500 text-xs mt-1">{errors.mod_username}</p>}
            </div>
            <div>
              <label htmlFor="mod_fname" className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="mod_fname" id="mod_fname" value={formData.mod_fname} onChange={handleChange} className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${errors.mod_fname ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.mod_fname && <p className="text-red-500 text-xs mt-1">{errors.mod_fname}</p>}
            </div>
             <div>
              <label htmlFor="mod_mname" className="block text-sm font-medium text-gray-700">Middle Name (Optional)</label>
              <input type="text" name="mod_mname" id="mod_mname" value={formData.mod_mname} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="mod_lname" className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="mod_lname" id="mod_lname" value={formData.mod_lname} onChange={handleChange} className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${errors.mod_lname ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.mod_lname && <p className="text-red-500 text-xs mt-1">{errors.mod_lname}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="mod_password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input type="password" name="mod_password" id="mod_password" value={formData.mod_password} onChange={handleChange} className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${errors.mod_password ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.mod_password && <p className="text-red-500 text-xs mt-1">{errors.mod_password}</p>}
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 disabled:bg-purple-400">
              {isLoading && <FaSpinner className="animate-spin" />}
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
