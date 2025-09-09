import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex flex-col justify-center items-center z-50 animate-fade-in">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-spin {
          animation: spin 1.5s linear infinite;
        }
      `}</style>
      <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-2xl transform scale-95 md:scale-100">
        <div className="flex justify-center items-center h-20 w-20 relative">
          <div className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-b-blue-500 border-r-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-xl md:text-2xl font-semibold text-gray-800 text-center">
          {message}
        </p>
      </div>
    </div>
  );
};

const ModeratorFormNavBar = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleReturn = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(-1);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <nav className="bg-blue-800 text-white p-4 flex justify-between items-center relative z-50 rounded-b-md">
        <h1 className="font-bold text-lg">Instructor Registration</h1>
        <button
          onClick={handleReturn}
          className="py-2 px-4 rounded-md text-white border border-white hover:bg-white hover:text-blue-800 transition-colors duration-200"
        >
          Return
        </button>
      </nav>
      {isLoading && <LoadingOverlay message="Returning... Your form will not be saved." />}
    </>
  );
};

const FaceRecord = () => {
  const videoRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setLoadingMessage("Accessing camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setLoadingMessage("Camera ready. Please show your face.");
          setIsLoading(false);
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      setLoadingMessage("Error accessing camera. Please check your permissions.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsLoading(true);
    setLoadingMessage("Recording complete. Navigating...");
    setTimeout(() => {
      navigate('/mod-panel');
    }, 1500);
  };

  return (
    <>
      <ModeratorFormNavBar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Facial Registration</h2>
          <p className="mb-4 text-gray-600">Please align your face with the camera to begin recording.</p>

          <div className="relative w-full aspect-video mx-auto mb-6 rounded-lg overflow-hidden border-4 border-gray-300">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            ></video>
          </div>

          <button
            onClick={handleDone}
            disabled={!isCameraReady}
            className={`w-full py-3 px-4 rounded-md shadow-sm text-sm font-medium transition-colors duration-200 ${
              isCameraReady
                ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            Done
          </button>
        </div>
      </div>
      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </>
  );
};

export default FaceRecord;
