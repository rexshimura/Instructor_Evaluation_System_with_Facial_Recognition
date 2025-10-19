// src/InstructorFaceRec.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSearch,
  FaSync,
  FaExclamationTriangle,
  FaCamera,
  FaIdCard,
  FaUsers,
  FaQrcode
} from "react-icons/fa";
import VerifyNavBar from "../../components/module_layout/VerifyNavBar";
import { apiService, luxandService } from "../../services/apiService";

export default function InstructorFaceRec() {
  const [selectedInstructorID, setSelectedInstructorID] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [faceRecognitionLoading, setFaceRecognitionLoading] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [detectedFaces, setDetectedFaces] = useState([]);
  const [scanningStatus, setScanningStatus] = useState("ready"); // ready, scanning, detected, recognized
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiService.getInstructors();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      setInstructors(data);
      setFilteredInstructors(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching instructors:", err);
      setError(err.message || "Failed to load instructors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, [retryCount]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredInstructors(instructors);
    } else {
      const filtered = instructors.filter(instructor =>
        `${instructor.ins_fname} ${instructor.ins_mname || ''} ${instructor.ins_lname} ${instructor.ins_suffix || ''} ${instructor.ins_dept} ${instructor.ins_id}`
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .includes(searchTerm.toLowerCase().trim())
      );
      setFilteredInstructors(filtered);
    }
  }, [searchTerm, instructors]);

  // Draw face detection boxes
  const drawFaceBoxes = (faces) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each face box
    faces.forEach((face, index) => {
      const bbox = face.bbox || face;
      const x = bbox[0];
      const y = bbox[1];
      const width = bbox[2];
      const height = bbox[3];

      // Draw bounding box
      ctx.strokeStyle = face.confidence > 0.8 ? '#00FF00' : '#FFFF00';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw background for text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, y - 25, 120, 25);

      // Draw text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
      
      if (face.name) {
        // Recognized face
        ctx.fillText(`${face.name} (${Math.round(face.confidence * 100)}%)`, x + 5, y - 8);
      } else {
        // Detected face
        ctx.fillText(`Face ${index + 1}`, x + 5, y - 8);
      }
    });
  };

  // Face Recognition Functions
  const startFaceRecognition = async () => {
    try {
      setFaceRecognitionLoading(true);
      setScanningStatus("scanning");
      setError(null);
      setDetectedFaces([]);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start continuous face detection
      startContinuousFaceDetection();

    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access denied. Please enable camera permissions to use face recognition.");
      setFaceRecognitionLoading(false);
      setScanningStatus("ready");
      setShowManualSearch(true);
    }
  };

  const startContinuousFaceDetection = () => {
    const detectInterval = setInterval(async () => {
      if (!videoRef.current || scanningStatus === "recognized") {
        clearInterval(detectInterval);
        return;
      }

      try {
        await captureAndDetectFaces();
      } catch (error) {
        console.error("Face detection error:", error);
      }
    }, 1000); // Detect every second
  };

  const captureAndDetectFaces = async () => {
    try {
      if (!videoRef.current) {
        throw new Error("Camera not ready");
      }

      // Capture image from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Convert to blob for Luxand API
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });

      // Call Luxand detection API
      const detectionResult = await luxandService.detectFaces(blob);
      
      if (detectionResult && detectionResult.status === 'success') {
        const faces = detectionResult.faces || [];
        
        if (faces.length > 0) {
          setScanningStatus("detected");
          setDetectedFaces(faces);
          drawFaceBoxes(faces);

          // If we have detected faces, try to recognize them
          if (faces.length === 1) { // Only try recognition when exactly one face is detected
            await captureAndRecognizeFace();
          }
        } else {
          setDetectedFaces([]);
          setScanningStatus("scanning");
          // Clear canvas
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      }
    } catch (error) {
      console.error("Face detection error:", error);
    }
  };

  const captureAndRecognizeFace = async () => {
    try {
      if (!videoRef.current) {
        throw new Error("Camera not ready");
      }

      // Capture image from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Convert to blob for Luxand API
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });

      console.log('🔍 Sending to Luxand for recognition...');
      console.log('📸 Image size:', blob.size, 'bytes');

      // Call Luxand recognition API
      const recognitionResult = await luxandService.recognize(blob);
      console.log('✅ Luxand raw response:', recognitionResult);

      // Process recognition result
      if (recognitionResult && recognitionResult.status === 'success') {
        const recognizedFaces = recognitionResult.result || [];

        console.log('👥 Number of faces recognized:', recognizedFaces.length);

        if (recognizedFaces.length > 0) {
          const bestMatch = recognizedFaces[0]; // Get the best match

          console.log('🎯 Best match details:', bestMatch);

          if (bestMatch.uuid) {
            // Find instructor by face UUID in your database
            console.log('🔍 Looking up instructor for UUID:', bestMatch.uuid);

            try {
              const instructorResult = await apiService.getInstructorByFaceUuid(bestMatch.uuid);

              if (instructorResult.success && instructorResult.instructor) {
                console.log('✅ Found instructor:', instructorResult.instructor);
                setScanningStatus("recognized");
                
                // Update face box with recognition info
                const recognizedFace = {
                  ...detectedFaces[0],
                  name: `${instructorResult.instructor.ins_fname} ${instructorResult.instructor.ins_lname}`,
                  confidence: bestMatch.probability || bestMatch.confidence || 0.95
                };
                setDetectedFaces([recognizedFace]);
                drawFaceBoxes([recognizedFace]);

                // Wait a moment to show the recognition result, then navigate
                setTimeout(() => {
                  setFaceRecognitionLoading(false);
                  stopCamera();
                  navigate(`/instructor-profile/${instructorResult.instructor.ins_id}`, {
                    state: {
                      recognized: true,
                      method: 'face_recognition',
                      confidence: bestMatch.probability || bestMatch.confidence || 0.95,
                      faceUuid: bestMatch.uuid
                    }
                  });
                }, 2000);
                
                return;
              } else {
                setError("Recognized face not associated with any instructor in our database.");
                console.log('❌ No instructor found for UUID:', bestMatch.uuid);
              }
            } catch (lookupError) {
              console.error('Error looking up instructor:', lookupError);
              setError("Error looking up instructor. Please try manual search.");
            }
          } else {
            setError("No face UUID returned from recognition service.");
            console.log('❌ No UUID in recognition result');
          }
        } else {
          setError("No face recognized. Please ensure good lighting and look directly at the camera.");
          console.log('❌ No faces found in the image');
        }
      } else {
        setError("Recognition service unavailable. Please try again or use manual search.");
        console.log('❌ Luxand API returned error:', recognitionResult);
      }

    } catch (error) {
      console.error("❌ Face recognition error:", error);
      setError(`Recognition failed: ${error.message}. Please try manual search.`);
    } finally {
      if (scanningStatus !== "recognized") {
        setFaceRecognitionLoading(false);
        setShowManualSearch(true);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleManualSearchFallback = () => {
    setShowManualSearch(true);
    stopCamera();
    setFaceRecognitionLoading(false);
    setScanningStatus("ready");
  };

  const handleViewProfile = () => {
    if (selectedInstructorID) {
      navigate(`/instructor-profile/${selectedInstructorID}`, {
        state: {
          recognized: false,
          method: 'manual_search'
        }
      });
    }
  };

  const handleRegisterFace = async () => {
    if (!selectedInstructorID) return;

    try {
      setActionLoading(true);
      navigate(`/face-record/${selectedInstructorID}`);
    } catch (error) {
      console.error('Error navigating to face registration:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setShowManualSearch(false);
    setFaceRecognitionLoading(false);
    setScanningStatus("ready");
    setDetectedFaces([]);
    stopCamera();
  };

  const getInstructorDisplayName = (instructor) => {
    const nameParts = [
      instructor.ins_fname,
      instructor.ins_mname,
      instructor.ins_lname,
      instructor.ins_suffix
    ].filter(part => part && part.trim() !== '');

    return `${nameParts.join(' ')} (${instructor.ins_dept})`;
  };

  const getInstructorOptionText = (instructor) => {
    const name = getInstructorDisplayName(instructor);
    return `${name} - ID: ${instructor.ins_id}`;
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getScanningMessage = () => {
    switch (scanningStatus) {
      case "scanning":
        return "Scanning for faces...";
      case "detected":
        return "Face detected! Analyzing...";
      case "recognized":
        return "Instructor recognized!";
      default:
        return "Look directly at the camera";
    }
  };

  const LoadingSpinner = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <VerifyNavBar />
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mt-16 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading instructors...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <VerifyNavBar />
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mt-16">
        <div className="flex flex-col items-center text-center">
          <FaExclamationTriangle className="text-5xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-gray-600 text-sm mb-6">
            Unable to connect to the server. Please check your internet connection and try again.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={loading}
            >
              <FaSync className={`text-sm ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Retrying...' : 'Retry'}
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error && !showManualSearch) return <ErrorState />;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <VerifyNavBar />

      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 mt-16">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <FaUserCircle className="text-6xl text-blue-600" />
            <div className="absolute -bottom-1 -right-1 bg-blue-100 rounded-full p-1">
              <FaQrcode className="text-blue-500 text-sm" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Instructor Identification
          </h2>
          <p className="text-center text-gray-500 text-sm">
            Use face recognition for quick access or manual search as alternative
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <FaExclamationTriangle className="flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Primary Feature: Face Recognition */}
        {!showManualSearch && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Face Recognition
              </h3>
              <p className="text-gray-600 mb-4">
                {getScanningMessage()}
              </p>
            </div>

            {/* Camera Preview with Face Detection Box */}
            <div className="relative w-full max-w-md mx-auto aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
              {faceRecognitionLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                    <p>{getScanningMessage()}</p>
                    <p className="text-sm text-gray-300 mt-1">Please look directly at the camera</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
                  <FaCamera className="text-4xl text-gray-400" />
                </div>
              )}
              
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-0"
              />
              
              {/* Canvas for Face Detection Boxes */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-5 pointer-events-none"
              />

              {/* Status Indicator */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  scanningStatus === "ready" ? "bg-gray-500 text-white" :
                  scanningStatus === "scanning" ? "bg-yellow-500 text-white" :
                  scanningStatus === "detected" ? "bg-blue-500 text-white" :
                  scanningStatus === "recognized" ? "bg-green-500 text-white" :
                  "bg-gray-500 text-white"
                }`}>
                  {scanningStatus.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!faceRecognitionLoading ? (
                <>
                  <button
                    onClick={startFaceRecognition}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition"
                  >
                    <FaCamera />
                    Start Face Recognition
                  </button>
                  <button
                    onClick={handleManualSearchFallback}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition"
                  >
                    <FaSearch />
                    Use Manual Search
                  </button>
                </>
              ) : (
                <button
                  onClick={handleManualSearchFallback}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  <FaExclamationTriangle />
                  Skip to Manual Search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Secondary Feature: Manual Search (Fallback) */}
        {showManualSearch && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Manual Search
              </h3>
              <p className="text-gray-600 mb-4">
                Search for your instructor profile manually
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, department, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Found {filteredInstructors.length} instructor(s) matching "{searchTerm}"
                </p>
              )}
            </div>

            {/* Selection Section */}
            <div className="flex flex-col items-center space-y-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Instructor:
                </label>
                <select
                  value={selectedInstructorID}
                  onChange={(e) => setSelectedInstructorID(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={filteredInstructors.length === 0}
                >
                  <option value="">
                    {filteredInstructors.length === 0 ? "No instructors found" : "Choose an instructor..."}
                  </option>
                  {filteredInstructors.map((instructor) => (
                    <option key={instructor.ins_id} value={instructor.ins_id}>
                      {getInstructorOptionText(instructor)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                  onClick={handleViewProfile}
                  disabled={!selectedInstructorID || actionLoading}
                  className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${selectedInstructorID
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    } ${actionLoading ? 'opacity-50' : ''}`}
                >
                  <FaIdCard />
                  View Profile
                </button>

                <button
                  onClick={handleRegisterFace}
                  disabled={!selectedInstructorID || actionLoading}
                  className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${selectedInstructorID
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    } ${actionLoading ? 'opacity-50' : ''}`}
                >
                  <FaCamera className={actionLoading ? 'animate-pulse' : ''} />
                  {actionLoading ? 'Loading...' : 'Register Face'}
                </button>
              </div>
            </div>

            {/* Selected Instructor Info */}
            {selectedInstructorID && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Selected Instructor:</h3>
                {(() => {
                  const instructor = instructors.find(inst => inst.ins_id == selectedInstructorID);
                  return instructor ? (
                    <div className="text-sm text-blue-700">
                      <p><strong>Name:</strong> {instructor.ins_fname} {instructor.ins_lname}</p>
                      <p><strong>Department:</strong> {instructor.ins_dept}</p>
                      <p><strong>ID:</strong> {instructor.ins_id}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}

        {/* Statistics Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
            <span>Total Instructors: {instructors.length}</span>
            <span>Showing: {filteredInstructors.length}</span>
            {showManualSearch && (
              <button
                onClick={() => setShowManualSearch(false)}
                className="text-blue-600 hover:text-blue-800 transition text-sm"
              >
                ← Back to Face Recognition
              </button>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-4 text-center">
          <button
            onClick={handleRetry}
            disabled={loading}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition disabled:opacity-50"
          >
            <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh List'}
          </button>
        </div>
      </div>

      {/* Feature Information */}
      <div className="mt-6 max-w-4xl w-full">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <FaUsers className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Identification Methods</h4>
              <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
                <li><strong>Face Recognition:</strong> Quick and automatic identification using camera</li>
                <li><strong>Manual Search:</strong> Search by name, department, or ID if face recognition fails</li>
                <li><strong>Register Face:</strong> Add new facial data for instructors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}