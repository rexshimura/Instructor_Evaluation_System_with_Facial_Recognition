import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import InputSearch from "../../../components/module_input/InputSearch_Instructor";

// --- Loading Overlay ---
const LoadingOverlay = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex flex-col justify-center items-center z-50 animate-fade-in">
    <style>{`
      @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      .animate-spin { animation: spin 1.5s linear infinite; }
    `}</style>
    <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-2xl">
      <div className="flex justify-center items-center h-20 w-20 relative">
        <div className="h-16 w-16 rounded-full border-4 border-t-blue-500 border-b-blue-500 border-r-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-xl font-semibold text-gray-800 text-center">
        {message}
      </p>
    </div>
  </div>
);

// --- Header/NavBar ---
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
      <nav className="bg-blue-800 text-white p-4 flex justify-between items-center rounded-b-md">
        <h1 className="font-bold text-lg">Instructor Registration</h1>
        <button
          onClick={handleReturn}
          className="py-2 px-4 rounded-md text-white border border-white hover:bg-white hover:text-blue-800 transition-colors duration-200"
        >
          Return
        </button>
      </nav>
      {isLoading && (
        <LoadingOverlay message="Returning... Your form will not be saved." />
      )}
    </>
  );
};

// --- Main Component ---
const FaceRecord = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [scanState, setScanState] = useState("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const [brightness, setBrightness] = useState(100);

  // Instructor selection
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const steps = [
    { id: "front", text: "Look straight ahead." },
    { id: "left", text: "Turn your head to the left." },
    { id: "right", text: "Turn your head to the right." },
  ];

  // Start camera only after instructor is selected
  useEffect(() => {
    if (selectedInstructor) startCamera();
    return () => stopCamera();
  }, [selectedInstructor]);

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
          return prev + 1;
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [scanState, currentStep]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage("Accessing camera...");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsLoading(false);
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      setLoadingMessage("Camera access denied. Please enable it.");
      console.error(err);
      setIsLoading(false);
      setIsCameraReady(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

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

  const handleRetake = () => {
    setCapturedImages([]);
    setCurrentStep(0);
    setProgress(0);
    setScanState("idle");
    startCamera();
  };

  const handleComplete = () => {
    setIsLoading(true);
    setLoadingMessage("Submitting...");
    stopCamera(); // 🔴 Close camera before submitting
    console.log("Instructor:", selectedInstructor);
    console.log("Captured images:", capturedImages);
    setTimeout(() => navigate("/mod-panel"), 2000);
  };

  return (
    <>
      <ModeratorFormNavBar />
      <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Facial Registration
          </h2>

          {!selectedInstructor ? (
            <>
              <p className="mb-4 text-gray-600">
                Search for an instructor first:
              </p>
              <InputSearch onSelect={(ins) => setSelectedInstructor(ins)} />
            </>
          ) : scanState !== "finished" ? (
            <>
              <p className="mb-4 text-gray-600">
                Instructor:{" "}
                <span className="font-semibold text-blue-700">
                  {selectedInstructor.fname} {selectedInstructor.lname}
                </span>
              </p>

              <p className="mb-4 font-medium">{steps[currentStep].text}</p>

              <div className="relative w-full max-w-md aspect-video mx-auto mb-6 rounded-lg overflow-hidden bg-gray-900">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ filter: `brightness(${brightness}%)` }}
                  className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
                />
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {scanState === "idle" && (
                <button
                  onClick={handleBeginScan}
                  disabled={!isCameraReady}
                  className="w-full py-3 px-6 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Begin Scan
                </button>
              )}
              {scanState === "scanning" && (
                <p className="text-center text-gray-600">Scanning...</p>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-4">Preview Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {capturedImages.map((img) => (
                  <div key={img.id}>
                    <img
                      src={img.url}
                      alt={img.id}
                      className="rounded-lg shadow-md"
                    />
                    <p className="mt-1 text-sm text-center capitalize">
                      {img.id}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleComplete}
                  className="flex-1 py-3 px-6 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700"
                >
                  Confirm & Submit
                </button>
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3 px-6 rounded-lg text-white font-semibold bg-yellow-500 hover:bg-yellow-600"
                >
                  Retake
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </>
  );
};

export default FaceRecord;
