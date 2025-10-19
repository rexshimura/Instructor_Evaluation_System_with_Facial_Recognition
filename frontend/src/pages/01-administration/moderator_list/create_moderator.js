import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa";

export default function CreateModerator({ isOpen, onClose, onSubmit, isLoading }) {
  const initialFormState = {
    mod_fname: "",
    mod_mname: "",
    mod_lname: "",
    mod_username: "",
    mod_password: "",
    created_by: "admin"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [currentAdmin, setCurrentAdmin] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setErrors({});
      setTouched({});
      setShowPassword(false);
      
      // Get current user from sessionStorage
      const userData = sessionStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          let creatorName = "admin";
          
          // Determine creator name based on user type
          if (parsedUser.admin_username) {
            creatorName = parsedUser.admin_username;
          } else if (parsedUser.mod_username) {
            creatorName = parsedUser.mod_username;
          } else if (parsedUser.mod_fname && parsedUser.mod_lname) {
            creatorName = `${parsedUser.mod_fname} ${parsedUser.mod_lname}`;
          }
          
          setCurrentAdmin(creatorName);
          setFormData(prev => ({ ...prev, created_by: creatorName }));
        } catch (error) {
          console.warn('Error parsing user data:', error);
        }
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
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
        } else if (value.length > 20) {
          error = "Username cannot exceed 20 characters.";
        }
        break;

      case "mod_password":
        if (!value) {
          error = "Password is required.";
        } else if (value.length < 6) {
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
    const fieldsToValidate = ["mod_fname", "mod_lname", "mod_username", "mod_password"];
    let isValid = true;
    const newTouched = {};

    fieldsToValidate.forEach(field => {
      newTouched[field] = true;
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    setTouched(newTouched);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Prepare data for submission - trim all string fields
      const submissionData = {
        mod_fname: formData.mod_fname.trim(),
        mod_mname: formData.mod_mname.trim() || "",
        mod_lname: formData.mod_lname.trim(),
        mod_username: formData.mod_username.trim(),
        mod_password: formData.mod_password,
        created_by: currentAdmin
      };
      onSubmit(submissionData);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Check if form has any errors
  const hasErrors = Object.values(errors).some(error => error);
  
  // Check if required fields are filled
  const isFormValid = 
    formData.mod_fname.trim() && 
    formData.mod_lname.trim() && 
    formData.mod_username.trim() && 
    formData.mod_password &&
    !hasErrors;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Create Moderator Account</h2>
          <button 
            onClick={handleClose} 
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:text-gray-300"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Created by:</strong> {currentAdmin}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            {/* Username */}
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
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.mod_username ? 'border-red-500 bg-red-50' : touched.mod_username ? 'border-blue-300' : 'border-gray-300'
                }`}
                placeholder="Enter unique username"
                maxLength={20}
                disabled={isLoading}
              />
              {errors.mod_username && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.mod_username}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                4-20 characters, letters, numbers, and underscores only
              </p>
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
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
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
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="mod_password" 
                  id="mod_password" 
                  value={formData.mod_password} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.mod_password ? 'border-red-500 bg-red-50' : touched.mod_password ? 'border-blue-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter password"
                  minLength={6}
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
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            </div>
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
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading && <FaSpinner className="animate-spin" />}
              {isLoading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Form Status */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            <strong>Form Status:</strong> {isFormValid ? "✅ Ready to submit" : "❌ Please fill all required fields correctly"}
          </p>
        </div>
      </div>
    </div>
  );
}