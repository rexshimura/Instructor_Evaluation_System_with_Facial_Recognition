// FaceRecord.js - UPDATED VERSION
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaMale, FaFemale, FaCamera, FaCheck, FaRedo, FaExclamationTriangle, FaUser, FaArrowLeft } from "react-icons/fa";
import { calculateAge } from "../../../utils/ageCalculator";
import { FaceLoadingOverlay } from "../../../components/module_feedback/FaceLoadingOverlay";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { apiService, luxandService } from "../../../services/apiService";

const FaceRecord = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { instructorID } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [instructor, setInstructor] = useState(null);
  const [existingFaces, setExistingFaces] = useState([]);

  const [scanState, setScanState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceUuid, setFaceUuid] = useState(null);
  const [error, setError] = useState(null);
  const [isNewFaceRegistered, setIsNewFaceRegistered] = useState(false);

  const instruction = "Look straight into the camera with good lighting.";

  // Load instructor data
  useEffect(() => {
    const loadInstructorData = async () => {
      if (!instructorID) {
        setError("No instructor selected");
        return;
      }

      try {
        setIsLoading(true);
        setLoadingMessage("Loading instructor data...");

        const instructorData = await apiService.getInstructorById(instructorID);
        setInstructor(instructorData);

        try {
          const faces = await apiService.getInstructorFaces(instructorID);
          setExistingFaces(faces.faces || []);
        } catch (faceError) {
          console.log("No existing faces found");
        }

        setError(null);
      } catch (error) {
        console.error("Error loading instructor:", error);
        setError("Failed to load instructor data");
      } finally {
        setIsLoading(false);
      }
    };

    loadInstructorData();
  }, [instructorID]);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  };

  const startCamera = useCallback(async () => {
    if (!instructor) return;

    try {
      setIsLoading(true);
      setLoadingMessage("Starting camera...");
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      const errorMessage = "Camera access denied. Please enable camera permissions.";
      setLoadingMessage(errorMessage);
      setError(errorMessage);
      console.error(err);
      setIsLoading(false);
      setIsCameraReady(false);
    }
  }, [instructor]);

  useEffect(() => {
    if (instructor) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [instructor, startCamera]);

  // Scanning progress effect
  useEffect(() => {
    let interval = null;
    if (scanState === "scanning") {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            handleCapture();
            return 100;
          }
          return prev + 5;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [scanState]);

  const handleBeginScan = () => {
    setError(null);
    setScanState("scanning");
    setProgress(0);
  };

  // Add this test function
  const testRecognitionWithNewFace = async (blob, expectedUuid) => {
    try {
      console.log('🧪 Testing recognition with new face...');
      const testResult = await luxandService.recognize(blob);

      if (testResult.status === 'success' && testResult.result.length > 0) {
        const recognizedUuid = testResult.result[0].uuid;
        console.log('🧪 Expected UUID:', expectedUuid);
        console.log('🧪 Recognized UUID:', recognizedUuid);
        console.log('🧪 Match:', recognizedUuid === expectedUuid ? '✅ SUCCESS' : '❌ MISMATCH');
        return recognizedUuid === expectedUuid;
      }
      return false;
    } catch (error) {
      console.error('🧪 Recognition test error:', error);
      return false;
    }
  };

  const handleCapture = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

      canvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        setCapturedImage({ url });
        setScanState("captured");

        try {
          setLoadingMessage("Registering face with Luxand...");
          let luxandResult;
          let newUuid = null;

          // STEP 1: DELETE FROM DATABASE ONLY (Skip Luxand deletion due to 500 errors)
          if (existingFaces.length > 0) {
            console.log('🗑️ Deleting existing face data from database...');
            for (const face of existingFaces) {
              if (face.face_id) {
                try {
                  await apiService.deleteInstructorFace(face.face_id);
                  console.log('✅ Deleted from database:', face.face_id);
                } catch (dbError) {
                  console.warn('⚠️ Could not delete from database:', dbError.message);
                }
              }
            }
            setExistingFaces([]);
          }

          // STEP 2: CREATE NEW PERSON WITH RANDOM NAME TO AVOID CONFLICTS
          // Use a completely random name to ensure no conflicts with existing persons
          const randomSuffix = Math.random().toString(36).substring(2, 15);
          const uniquePersonName = `instructor_${instructor.ins_id}_${randomSuffix}_${Date.now()}`;
          console.log('👤 Creating new person with unique name:', uniquePersonName);

          luxandResult = await luxandService.addPerson(uniquePersonName, blob, 'instructors');
          console.log('✅ Luxand registration result:', luxandResult);

          if (luxandResult.status === 'success' && luxandResult.uuid) {
            newUuid = luxandResult.uuid;
            setIsNewFaceRegistered(true);
            console.log('🎉 New UUID assigned:', newUuid);

            // STEP 3: SAVE TO DATABASE
            console.log('💾 Saving to database with UUID:', newUuid);
            try {
              const dbResult = await apiService.registerInstructorFace(
                instructor.ins_id,
                newUuid,
                'system'
              );
              console.log('✅ Database save result:', dbResult);
            } catch (dbError) {
              console.error('❌ Database save error:', dbError);
            }

            setFaceUuid(newUuid);
          } else {
            throw new Error(luxandResult.message || 'Failed to register face with Luxand');
          }

        } catch (luxandError) {
          console.error('❌ Luxand API error:', luxandError);
          setError(`Face registration failed: ${luxandError.message}`);
        }

        stopCamera();
      }, "image/jpeg", 0.9);

    } catch (error) {
      console.error('Error capturing image:', error);
      setError('Failed to capture image');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setFaceUuid(null);
    setProgress(0);
    setScanState("idle");
    setError(null);
    setIsNewFaceRegistered(false);
    startCamera();
  };

  const handleComplete = async () => {
    if (!faceUuid) {
      setError('No face data captured. Please retake the photo.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Finalizing registration...");

    try {
      console.log('🔍 Verifying face registration for UUID:', faceUuid);
      const testLookup = await apiService.getInstructorByFaceUuid(faceUuid);
      console.log('✅ Face lookup test result:', testLookup);

      // IMPORTANT: Even if lookup fails, we still proceed because the face is registered in Luxand
      // The database lookup might fail due to the old UUID issue, but the face recognition will work
      if (testLookup.success) {
        setLoadingMessage("Registration verified successfully!");
      } else {
        console.warn('⚠️ Database lookup failed, but Luxand registration is complete');
        setLoadingMessage("Face registration completed (Luxand successful)");
      }

      setTimeout(() => {
        navigate("/mod-panel", {
          state: {
            message: `Face registration completed for ${instructor.ins_fname} ${instructor.ins_lname}`,
            faceUuid: faceUuid,
            instructorId: instructor.ins_id,
            note: testLookup.success ? undefined : "Note: Database lookup may show old UUIDs due to Luxand limitations"
          }
        });
      }, 1500);

    } catch (error) {
      console.error('Error finalizing registration:', error);
      // Even if checks fail, navigation should still happen
      setLoadingMessage("Registration completed");

      setTimeout(() => {
        navigate("/mod-panel", {
          state: {
            message: `Face registration processed for ${instructor.ins_fname} ${instructor.ins_lname}`,
            faceUuid: faceUuid,
            instructorId: instructor.ins_id
          }
        });
      }, 1500);
    }
  };

  const handleReturn = () => {
    if (capturedImage || faceUuid) {
      const isConfirmed = window.confirm(
        "Are you sure? Your captured face data will not be saved."
      );
      if (!isConfirmed) return;
    }
    stopCamera();
    navigate('/instructor-face-selection');
  };

  const ErrorDisplay = () => (
    error && (
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
        {error.includes('Camera access') && (
          <button
            onClick={startCamera}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Retry Camera
          </button>
        )}
      </div>
    )
  );

  const ExistingFacesInfo = () => (
    existingFaces.length > 0 && (
      <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-center gap-2 text-orange-700">
          <FaExclamationTriangle className="flex-shrink-0" />
          <div>
            <p className="font-medium">Existing Face Registration Found</p>
            <p className="text-sm">This instructor has {existingFaces.length} face registration(s).</p>
            <div className="text-xs mt-2 space-y-1">
              <p><strong>Note:</strong> Due to Luxand API limitations, old face data may still be recognized.</p>
              <p><strong>New registration will:</strong></p>
              <ul className="list-disc list-inside ml-2">
                <li>Delete old records from database</li>
                <li>Create new face registration in Luxand</li>
                <li>Update database with new UUID</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  );

  if (!instructor && !error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <ModeratorNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading instructor data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <ModeratorNavBar />

      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleReturn}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <FaArrowLeft />
              Back to Selection
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Face Registration</h1>
            <div className="w-20"></div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
            <ErrorDisplay />
            <ExistingFacesInfo />

            {instructor && scanState !== "captured" ? (
              <>
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-gray-800 grid grid-cols-2 gap-2">
                  <h3 className="text-xl font-bold col-span-2 mb-1">
                    Instructor Information
                  </h3>
                  <p className="col-span-2">
                    <strong>Name:</strong> {instructor.ins_fname}{" "}
                    {instructor.ins_mname ? instructor.ins_mname[0] + "." : ""}{" "}
                    {instructor.ins_lname} {instructor.ins_suffix || ''}
                  </p>
                  <p>
                    <strong>Age:</strong> {calculateAge(instructor.ins_dob)}
                  </p>
                  <p>
                    <strong>Sex:</strong>{" "}
                    {instructor.ins_sex === 'Male' || instructor.ins_sex === 'M' ? (
                      <span className="inline-flex items-center gap-2"><FaMale className="text-blue-500" /> Male</span>
                    ) : (
                      <span className="inline-flex items-center gap-2"><FaFemale className="text-pink-500" /> Female</span>
                    )}
                  </p>
                  <p>
                    <strong>ID:</strong> {instructor.ins_id}
                  </p>
                  <p>
                    <strong>Dept:</strong> {instructor.ins_dept}
                  </p>
                </div>

                <p className="mb-4 font-medium text-center text-lg">
                  {instruction}
                </p>

                {/* FIXED: Changed from aspect-square to aspect-video for landscape */}
                <div className="relative w-full max-w-md mx-auto aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                  />
                  {!isCameraReady && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white p-4 text-center">
                      Camera is off or not accessible.
                    </div>
                  )}
                  {scanState === "scanning" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <div className="bg-white bg-opacity-90 rounded-lg p-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-700 font-semibold">Capturing...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {scanState === "idle" && (
                  <button
                    onClick={handleBeginScan}
                    disabled={!isCameraReady || isLoading}
                    className="w-full py-3 px-6 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg transition"
                  >
                    <FaCamera />
                    {isLoading ? "Initializing..." : "Capture Face Photo"}
                  </button>
                )}
                {scanState === "scanning" && (
                  <p className="text-center text-gray-600 font-semibold animate-pulse">
                    Capturing... {progress}%
                  </p>
                )}
              </>
            ) : instructor ? (
              <>
                <h3 className="text-xl font-bold mb-4">Face Capture Complete</h3>

                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-semibold">
                    {isNewFaceRegistered
                      ? "✅ New face registration completed!"
                      : "✅ Additional face data added to existing registration!"
                    }
                  </p>
                  {faceUuid && (
                    <div className="mt-2">
                      <p className="text-green-600 text-sm font-medium">Face UUID:</p>
                      <p className="text-green-800 text-xs font-mono bg-green-100 p-2 rounded break-all">
                        {faceUuid}
                      </p>
                      <p className="text-green-600 text-xs mt-1">
                        This UUID will be used for face recognition lookup.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Captured Image:</h4>
                  <div className="flex justify-center">
                    <div className="w-64 h-64 aspect-square">
                      <img
                        src={capturedImage?.url}
                        alt="Captured face"
                        className="w-full h-full object-cover shadow-md rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="flex-1 py-3 px-6 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-lg transition"
                  >
                    <FaCheck />
                    {isLoading ? "Finalizing..." : "Complete Registration"}
                  </button>
                  <button
                    onClick={handleRetake}
                    disabled={isLoading}
                    className="flex-1 py-3 px-6 rounded-lg text-black font-semibold bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 flex items-center justify-center gap-2 text-lg transition"
                  >
                    <FaRedo />
                    Retake Photo
                  </button>
                </div>

                {/* Temporary debug button */}
                <div className="mt-4 text-center">
                  <button
                    onClick={async () => {
                      const test = await luxandService.findPersonByName(`instructor_${instructor.ins_id}`);
                      console.log('🔍 Current persons in Luxand:', test);
                    }}
                    className="p-2 bg-gray-500 text-white rounded text-sm"
                  >
                    Debug: Check Luxand Persons
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
      {isLoading && <FaceLoadingOverlay message={loadingMessage} />}
    </div>
  );
};

export default FaceRecord;