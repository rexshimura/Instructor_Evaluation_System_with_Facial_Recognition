import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner, FaExclamationTriangle, FaEye, FaEyeSlash } from "react-icons/fa";

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
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

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
      setTouched({});
      setShowPassword(false);
    } else if (!isOpen) {
      setFormData(initialFormState);
      setApiError("");
      setTouched({});
    }
  }, [isOpen, moderatorData]);

  const handleClose = () => {
    if (!isLoading) {
      setApiError("");
      onClose();
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation for touched fields
    if (touched[name]) {
      validateField(name, value);
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    if (apiError) {
      setApiError("");
    }
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "mod_fname":
        if (!value.trim()) {
          error = "First name is required.";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "First name can only contain letters and spaces.";
        } else if (value.trim().length < 2) {
          error = "First name must be at least 2 characters.";
        }
        break;

      case "mod_mname":
        if (value.trim() && !/^[a-zA-Z\s]*$/.test(value)) {
          error = "Middle name can only contain letters and spaces.";
        }
        break;

      case "mod_lname":
        if (!value.trim()) {
          error = "Last name is required.";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "Last name can only contain letters and spaces.";
        } else if (value.trim().length < 2) {
          error = "Last name must be at least 2 characters.";
        }
        break;

      case "mod_username":
        if (!value.trim()) {
          error = "Username is required.";
        } else if (value.length < 4) {
          error = "Username must be at least 4 characters.";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = "Username can only contain letters, numbers, and underscores.";
        }
        break;

      case "mod_password":
        if (value && value.length < 6) {
          error = "Password must be at least 6 characters.";
        } else if (value.length > 50) {
          error = "Password cannot exceed 50 characters.";
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fieldsToValidate = ["mod_fname", "mod_lname", "mod_username"];
    let isValid = true;
    const newTouched = {};

    fieldsToValidate.forEach(field => {
      newTouched[field] = true;
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    // Validate password only if it's not empty
    if (formData.mod_password.trim()) {
      newTouched.mod_password = true;
      if (!validateField("mod_password", formData.mod_password)) {
        isValid = false;
      }
    }

    setTouched(newTouched);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const dataToSubmit = {
          mod_fname: formData.mod_fname.trim(),
          mod_mname: formData.mod_mname.trim() || "",
          mod_lname: formData.mod_lname.trim(),
          mod_username: formData.mod_username.trim(),
        };
        
        // Only include password if it's not empty
        if (formData.mod_password.trim()) {
          dataToSubmit.mod_password = formData.mod_password;
        }
        
        await onSubmit(moderatorData.mod_id, dataToSubmit);
      } catch (error) {
        setApiError(error.message || "Failed to update moderator");
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Check if form has any errors in required fields
  const hasRequiredErrors = 
    errors.mod_fname || 
    errors.mod_lname || 
    errors.mod_username;

  // Check if required fields are filled and valid
  const isFormValid = 
    formData.mod_fname.trim() && 
    formData.mod_lname.trim() && 
    formData.mod_username.trim() &&
    !hasRequiredErrors;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
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
          <div className="space-y-4">
            {/* Username - Read Only */}
            <div>
              <label htmlFor="mod_username" className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="mod_username" 
                id="mod_username" 
                value={formData.mod_username} 
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={true}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                title="Username cannot be changed"
              />
              <p className="text-gray-500 text-xs mt-1">Username cannot be changed for security reasons</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* First Name */}
              <div className="md:col-span-1">
                <label htmlFor="mod_fname" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="mod_fname" 
                  id="mod_fname" 
                  value={formData.mod_fname} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.mod_fname ? 'border-red-500 bg-red-50' : touched.mod_fname ? 'border-blue-300' : 'border-gray-300'
                  }`}
                  placeholder="First name"
                  maxLength={50}
                  disabled={isLoading}
                />
                {errors.mod_fname && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.mod_fname}
                  </p>
                )}
              </div>

              {/* Middle Name */}
              <div className="md:col-span-1">
                <label htmlFor="mod_mname" className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input 
                  type="text" 
                  name="mod_mname" 
                  id="mod_mname" 
                  value={formData.mod_mname} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.mod_mname ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Middle"
                  maxLength={50}
                  disabled={isLoading}
                />
                {errors.mod_mname && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.mod_mname}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="md:col-span-1">
                <label htmlFor="mod_lname" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="mod_lname" 
                  id="mod_lname" 
                  value={formData.mod_lname} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.mod_lname ? 'border-red-500 bg-red-50' : touched.mod_lname ? 'border-blue-300' : 'border-gray-300'
                  }`}
                  placeholder="Last name"
                  maxLength={50}
                  disabled={isLoading}
                />
                {errors.mod_lname && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.mod_lname}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="mod_password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
                <span className="text-gray-500 text-xs ml-1 font-normal">
                  (Leave blank to keep current password)
                </span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="mod_password" 
                  id="mod_password" 
                  placeholder="Enter new password to change"
                  value={formData.mod_password} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.mod_password ? 'border-red-500 bg-red-50' : touched.mod_password ? 'border-blue-300' : 'border-gray-300'
                  }`}
                  maxLength={50}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {errors.mod_password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.mod_password}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Minimum 6 characters if changing password
              </p>
            </div>
          </div>
          
          {/* Form Status */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Form Status:</strong> {isFormValid ? "✅ Ready to submit" : "❌ Please fill all required fields correctly"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={isLoading}
              className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !isFormValid}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading && <FaSpinner className="animate-spin" />}
              {isLoading ? "Updating..." : "Update Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}