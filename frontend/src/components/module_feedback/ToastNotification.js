import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

// Map notification types to icons and colors
const TOAST_STYLES = {
  success: {
    icon: <FaCheckCircle className="text-green-500" size={24} />,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
  },
  error: {
    icon: <FaExclamationCircle className="text-red-500" size={24} />,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-400',
  },
  info: {
    icon: <FaInfoCircle className="text-blue-500" size={24} />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
  },
};

export default function Toast({ message, type, onClose }) {
  // Automatically close the toast after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const style = TOAST_STYLES[type] || TOAST_STYLES.info;

  return (
    <div className={`fixed top-5 right-5 z-[100] transform transition-transform duration-300 animate-slideIn`}>
      <div className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 ${style.bgColor} ${style.borderColor}`}>
        <div className="flex-shrink-0">{style.icon}</div>
        <div className="ml-3 text-sm font-medium text-gray-700">{message}</div>
        <button onClick={onClose} className="ml-4 -mr-1 p-1 rounded-md hover:bg-gray-200 focus:outline-none">
          <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}