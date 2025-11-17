import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaMale, FaFemale, FaCamera, FaCheck, FaRedo, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
// Make sure these import paths are correct for your project structure
// import { calculateAge } from "../../../utils/ageCalculator"; // Removed: Not used
import { FaceLoadingOverlay } from "../../../components/module_feedback/FaceLoadingOverlay";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { apiService } from "../../../services/apiService"; // Keeping this for getInstructorById

// Using port 5000 and prefix /rekognition
const BACKEND_URL_REGISTRATION = process.env.REACT_APP_API_URL || "http://localhost:5000/rekognition";

const FaceRecord = () => {
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const { instructorID } = useParams();

    // --- State ---
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Initializing...");
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [instructor, setInstructor] = useState(null);

    // New state for AWS flow
    const [awsFaceId, setAwsFaceId] = useState(null);
    const [createdBy, setCreatedBy] = useState("mod_system"); // Default moderator ID, can be changed

    // UI/Capture state
    const [scanState, setScanState] = useState("idle"); // idle, scanning, captured, success
    const [progress, setProgress] = useState(0);
    const [capturedImage, setCapturedImage] = useState(null); // Will store { url, blob }
    const [error, setError] = useState(null);

    // --- Camera Controls ---
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((t) => t.stop());
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
            console.log("[startCamera] Requesting video stream...");

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            console.log("[startCamera] Stream received:", stream.id);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.error("Play error:", e));
                videoRef.current.onloadedmetadata = () => {
                    console.log("[startCamera] Video metadata loaded.");
                    setIsLoading(false);
                    setIsCameraReady(true);
                };
            }
        } catch (err) {
            console.error("[startCamera] Error:", err);
            setError(`Camera Error: ${err.message}`);
            setLoadingMessage(`Camera Error: ${err.message}`);
            setIsLoading(false);
            setIsCameraReady(false);
        }
    }, [instructor]);

    // --- Data Loading Effect ---
    useEffect(() => {
        const loadData = async () => {
            if (!instructorID) return;
            try {
                setIsLoading(true);
                setLoadingMessage("Loading instructor data...");

                // Use your existing apiService to fetch instructor
                const instructorData = await apiService.getInstructorById(instructorID);
                setInstructor(instructorData);

            } catch (error) {
                console.error("Init Error:", error);
                setError("Failed to load instructor data.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [instructorID]);

    // --- Camera Trigger Effect ---
    useEffect(() => {
        // Start camera only if we have an instructor and camera isn't ready
        if (instructor && !isCameraReady) {
            startCamera();
        }
        // Cleanup on unmount
        return () => {
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instructor]); // Only depends on instructor

    // --- Capture Handler (Now just captures, doesn't register) ---
    const handleCapture = useCallback(async () => {
        if (!videoRef.current) return;

        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    throw new Error("Canvas toBlob returned null");
                }
                const url = URL.createObjectURL(blob);
                setCapturedImage({ url, blob }); // Store both URL for preview and Blob for upload
                setScanState("captured");
                stopCamera(); // Stop video stream after capture
            }, "image/jpeg", 0.9);

        } catch (error) {
            console.error("Capture error:", error);
            setError("Failed to capture image");
            setScanState("idle");
        }
    }, []); // No dependencies needed

    // --- Progress Bar Effect ---
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
    }, [scanState, handleCapture]);

    // --- NEW: AWS Registration Handler ---
    const handleConfirmRegistration = async () => {
        if (!capturedImage?.blob || !instructor?.ins_id || !createdBy) {
            setError("Missing data. Cannot register face.");
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Registering face with AWS...");
        setError(null);

        // Build the FormData
        const formData = new FormData();
        formData.append('image', capturedImage.blob, 'instructor-face.jpg');
        formData.append('ins_id', instructor.ins_id);
        formData.append('created_by', createdBy);

        try {
            // Call the AWS backend endpoint
            const response = await fetch(`${BACKEND_URL_REGISTRATION}/register-face`, {
                method: 'POST',
                body: formData, // No 'Content-Type' header, FormData sets it
            });

            const data = await response.json();

            if (response.ok) {
                console.log("[AWS Register] Success:", data);
                setAwsFaceId(data.awsFaceId); // Save the new AWS Face ID
                setScanState("success"); // Move to success screen
                setLoadingMessage("Face registered successfully!");
            } else {
                console.error("[AWS Register] Fail:", data);
                // The backend error message is sent here, e.g., "AccessDeniedException"
                setError(data.error || "Failed to register face.");
                setScanState("captured"); // Go back to confirm screen
            }
        } catch (apiError) {
            console.error("Registration error:", apiError);
            setError(`Registration failed: ${apiError.message}`);
            setScanState("captured"); // Go back to confirm screen
        } finally {
            setIsLoading(false);
        }
    };

    // --- UI Event Handlers ---
    const handleBeginScan = () => {
        setError(null);
        setScanState("scanning");
        setProgress(0);
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setAwsFaceId(null);
        setProgress(0);
        setScanState("idle");
        setError(null);
        startCamera(); // Restart camera
    };

    const handleComplete = () => {
        // Navigate away after success
        navigate("/mod-panel", {
            state: {
                message: `Face registered for ${instructor.ins_fname}`,
                instructorId: instructor.ins_id
            }
        });
    };

    const handleReturn = () => {
        stopCamera();
        navigate('/instructor-face-selection'); // Or wherever you came from
    };

    // --- Render ---
    if (!instructor && !error) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <ModeratorNavBar />
                <div className="flex-1 flex items-center justify-center">
                    <FaceLoadingOverlay message={loadingMessage || "Loading..."} />
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
                        <button onClick={handleReturn} className="flex items-center gap-2 text-gray-600">
                            <FaArrowLeft /> Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">AWS Face Registration</h1>
                        <div className="w-20"></div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-xl">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                <FaExclamationTriangle /> {error}
                                {error.includes('Camera') && <button onClick={startCamera} className="ml-auto underline">Retry</button>}
                            </div>
                        )}

                        {/* --- STATE 1: SUCCESS --- */}
                        {scanState === "success" && (
                            <div className="text-center">
                                <div className="inline-block p-4 bg-green-100 rounded-full text-green-600 mb-4">
                                    <FaCheck size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Registration Complete!</h3>
                                <p className="text-gray-600 mb-4">
                                    Successfully registered face for {instructor.ins_fname}.
                                </p>
                                <p className="text-sm text-gray-500 mb-6">AWS Face ID: {awsFaceId}</p>
                                {capturedImage && (
                                    <img src={capturedImage.url} alt="Captured" className="w-48 h-48 object-cover rounded-lg shadow-md mx-auto mb-6 border-4 border-white" />
                                )}
                                <button onClick={handleComplete} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                                    Finish & Return
                                </button>
                            </div>
                        )}

                        {/* --- STATE 2: CONFIRM CAPTURE --- */}
                        {scanState === "captured" && (
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Capture</h3>
                                {capturedImage && (
                                    <img src={capturedImage.url} alt="Captured" className="w-48 h-48 object-cover rounded-lg shadow-md mx-auto mb-6 border-4 border-white" />
                                )}
                                <div className="mb-4 text-left">
                                    <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Moderator ID (Created By)
                                    </label>
                                    <input
                                        type="text"
                                        id="createdBy"
                                        value={createdBy}
                                        onChange={(e) => setCreatedBy(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Enter your moderator ID"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={handleConfirmRegistration} disabled={!createdBy} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
                                        Confirm & Register
                                    </button>
                                    <button onClick={handleRetake} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300">
                                        Retake
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* --- STATE 3: IDLE / SCANNING --- */}
                        {(scanState === "idle" || scanState === "scanning") && instructor && (
                            <>
                                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="font-bold text-lg">{instructor.ins_fname} {instructor.ins_lname}</h3>
                                    <p className="text-sm text-gray-600">ID: {instructor.ins_id}</p>
                                </div>

                                <div className="relative w-full max-w-md mx-auto aspect-video bg-black rounded-lg overflow-hidden mb-6">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                                    {scanState === "scanning" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xl font-bold">
                                            {progress}%
                                        </div>
                                    )}
                                </div>

                                {scanState === "idle" && (
                                    <button
                                        onClick={handleBeginScan}
                                        disabled={!isCameraReady}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                                    >
                                        <FaCamera /> Capture Face
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {isLoading && <FaceLoadingOverlay message={loadingMessage} />}
        </div>
    );
};

export default FaceRecord;