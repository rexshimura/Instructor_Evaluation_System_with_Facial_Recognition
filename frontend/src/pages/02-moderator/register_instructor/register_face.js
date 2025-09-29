import React, { useState, useEffect, useRef, useCallback } from "react"; // ✨ FIX: Imported useCallback
import { useNavigate, useParams } from "react-router-dom";
import instructorData from "../../../data/list-instructors";
import { FaMale, FaFemale, FaCamera, FaCheck, FaRedo, FaArrowLeft } from "react-icons/fa";
import {calculateAge} from "../../../utils/ageCalculator";
import {FaceLoadingOverlay} from "../../../components/module_feedback/FaceLoadingOverlay";
import {InstructorListSearch} from "../../../components/module_input/InputSearch_InstructorList";
import {RegisterInstructorNavBar} from "../../../components/module_layout/RegisterInstructorNavBar";

// --- Main Component ---
const FaceRecord = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { instructorID } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [scanState, setScanState] = useState("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);

  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const steps = [
    { id: "front", text: "Look straight into the camera." },
    { id: "left", text: "Slowly turn your head to the left." },
    { id: "right", text: "Slowly turn your head to the right." },
  ];

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraReady(false);
  };

  // `startCamera` is wrapped in `useCallback` so it can be called from anywhere
  // without being redefined, solving the "Retake" issue.
  const startCamera = useCallback(async () => {
    if (!selectedInstructor) return;
    try {
      setIsLoading(true);
      setLoadingMessage("Loading Camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      setLoadingMessage("Camera access denied. Please enable it in your browser settings.");
      console.error(err);
      setIsLoading(false);
      setIsCameraReady(false);
    }
  }, [selectedInstructor]);

  useEffect(() => {
    if (instructorID) {
      const found = instructorData.find(
        (inst) => String(inst.in_instructorID) === String(instructorID)
      );
      if (found) setSelectedInstructor(found);
    } else {
        setSelectedInstructor(null);
        stopCamera();
    }
  }, [instructorID]);

  // This effect now correctly starts the camera when the instructor is selected.
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [selectedInstructor, startCamera]);

  // Scanning progress effect (no changes)
  useEffect(() => {
    let interval = null;
    if (scanState === "scanning" && currentStep < steps.length) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            handleCapture();
            return 100;
          }
          return prev + 2;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [scanState, currentStep]);


  const handleBeginScan = () => setScanState("scanning");

  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const url = canvas.toDataURL("image/jpeg");

    setCapturedImages((prev) => [...prev, { id: steps[currentStep].id, url }]);
    setScanState("captured");

    setTimeout(() => {
      const next = currentStep + 1;
      if (next < steps.length) {
        setCurrentStep(next);
        setProgress(0);
        setScanState("scanning");
      } else {
        setScanState("finished");
        stopCamera();
      }
    }, 1200);
  };

  // ✨ FIX: Handle Retake now correctly calls `startCamera`.
  const handleRetake = () => {
    setCapturedImages([]);
    setCurrentStep(0);
    setProgress(0);
    setScanState("idle");
    startCamera(); // Explicitly restart the camera.
  };

  const handleComplete = () => {
    setIsLoading(true);
    setLoadingMessage("Submitting Registration...");
    stopCamera();
    console.log("Instructor:", selectedInstructor);
    console.log("Captured images:", capturedImages);
    setTimeout(() => navigate("/mod-panel"), 2000);
  };

  // Handle Return now checks for captured images and shows a confirmation.
  // The problematic loading state has been removed to prevent the "stuck loading" bug.
  const handleReturn = () => {
    if (capturedImages.length > 0) {
      const isConfirmed = window.confirm(
        "Are you sure? Your captured images will not be saved."
      );
      if (!isConfirmed) {
        return; // User clicked "Cancel", so we stop here.
      }
    }
    // If no images OR user clicked "OK", navigate back.
    stopCamera(); // stop camera if return haha
    navigate('/mod-panel');
  };

  return (
    <>
      <RegisterInstructorNavBar onReturn={handleReturn} />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Facial Registration
          </h2>

          {!selectedInstructor ? (
            <>
              <p className="mb-4 text-gray-600">
                Please search for an instructor to begin registration:
              </p>
              <InstructorListSearch
                onSelect={(ins) => setSelectedInstructor(ins)}
                navigate={navigate}
              />
            </>
          ) : scanState !== "finished" ? (
            <>
              {/* Instructor Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-gray-800 grid grid-cols-2 gap-2">
                <h3 className="text-xl font-bold col-span-2 mb-1">
                  Instructor Information
                </h3>
                <p className="col-span-2">
                  <strong>Name:</strong> {selectedInstructor.in_fname}{" "}
                  {selectedInstructor.in_mname
                    ? selectedInstructor.in_mname[0] + "."
                    : ""}{" "}
                  {selectedInstructor.in_lname} {selectedInstructor.in_suffix}
                </p>
                <p>
                  <strong>Age:</strong>{" "}
                  {calculateAge(selectedInstructor.in_dob)}
                </p>
                <p>
                  <strong>Sex:</strong>{" "}
                  {selectedInstructor.in_sex === 'M' ? (
                     <span className="inline-flex items-center gap-2"><FaMale className="text-blue-500"/> Male</span>
                  ) : (
                     <span className="inline-flex items-center gap-2"><FaFemale className="text-pink-500"/> Female</span>
                  )}
                </p>
              </div>

              <p className="mb-4 font-medium text-center text-lg">{steps[currentStep].text}</p>

              <div className="relative w-full max-w-sm aspect-square mx-auto mb-6 rounded-lg overflow-hidden bg-gray-900 shadow-lg">
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
                  disabled={!isCameraReady}
                  className="w-full py-3 px-6 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  <FaCamera />
                  Begin Scan
                </button>
              )}
              {scanState === "scanning" && (
                <p className="text-center text-gray-600 font-semibold animate-pulse">Scanning...</p>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-4">Preview Images</h3>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {capturedImages.map((img) => (
                  <div key={img.id} className="aspect-square">
                    <img
                      src={img.url}
                      alt={img.id}
                      className="w-full h-full object-cover shadow-md"
                    />
                    <p className="mt-1 text-xs text-center font-semibold uppercase tracking-wider">
                      {img.id}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleComplete}
                  className="flex-1 py-3 px-6 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 text-lg"
                >
                  <FaCheck />
                  Confirm & Submit
                </button>
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3 px-6 rounded-lg text-black font-semibold bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center gap-2 text-lg"
                >
                  <FaRedo />
                  Retake
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {isLoading && <FaceLoadingOverlay message={loadingMessage} />}
    </>
  );
};

export default FaceRecord;