import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaMale, FaFemale, FaCamera, FaCheck, FaRedo, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
// Make sure these import paths are correct for your project structure
import { calculateAge } from "../../../utils/ageCalculator";
import { FaceLoadingOverlay } from "../../../components/module_feedback/FaceLoadingOverlay";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { apiService } from "../../../services/apiService"; // Uses the new Luxand apiService

const FaceRecord = () => {
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const { instructorID } = useParams();

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Initializing...");
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [instructor, setInstructor] = useState(null);
    const [existingFaces, setExistingFaces] = useState([]);

    // --- State for Luxand ---
    const [luxandSubjectId, setLuxandSubjectId] = useState(null);
    const [registeredFaceUuid, setRegisteredFaceUuid] = useState(null);

    const [scanState, setScanState] = useState("idle");
    const [progress, setProgress] = useState(0);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);

    // --- Unchanged Functions ---
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
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setIsLoading(false);
                    setIsCameraReady(true);
                };
            }
        } catch (err) {
            console.error("Camera Error:", err);
            const errorMessage = "Camera access denied. Please enable camera permissions.";
            setLoadingMessage(errorMessage);
            setError(errorMessage);
            setIsLoading(false);
            setIsCameraReady(false);
        }
    }, [instructor]);

    const handleBeginScan = () => {
        setError(null);
        setScanState("scanning");
        setProgress(0);
    };

    // --- SIMPLIFIED INITIALIZATION EFFECT (No Azure) ---
    useEffect(() => {
        const loadData = async () => {
            if (!instructorID) {
                setError("No instructor selected");
                return;
            }

            try {
                setIsLoading(true);
                setLoadingMessage("Loading instructor data..."); // <-- Simplified
                console.log(`[FaceRecord] Fetching data for instructorID: ${instructorID}`);

                // 1. Get Instructor Data
                const instructorData = await apiService.getInstructorById(instructorID);
                console.log("[FaceRecord] ✅ Instructor data loaded:", instructorData);
                setInstructor(instructorData);

                // 2. Get Existing Faces (for display/warning only)
                try {
                    console.log("[FaceRecord] Checking existing faces...");
                    // This calls GET /instructor-faces/instructor/:id
                    const facesData = await apiService.getInstructorFaces(instructorID);
                    setExistingFaces(facesData.faces || []);
                    if (facesData.faces && facesData.faces.length > 0) {
                        console.log(`[FaceRecord] Found ${facesData.faces.length} existing faces.`);
                    }
                } catch (faceError) {
                    console.warn("[FaceRecord] ⚠️ No existing faces found (this is normal):", faceError);
                }

                setError(null);
            } catch (error) {
                console.error("[FaceRecord] ❌ CRITICAL INITIALIZATION ERROR:", error);
                setError("Failed to load data. Check browser console (F12) for details.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [instructorID]);

    // --- Unchanged camera/progress effects ---
    useEffect(() => {
        if (instructor && !isLoading && !error) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [instructor, startCamera, isLoading, error]);

    useEffect(() => {
        let interval = null;
        if (scanState === "scanning") {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        handleCapture(); // <-- Automatically calls handleCapture
                        return 100;
                    }
                    return prev + 5;
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [scanState]); // Note: handleCapture isn't a dependency to avoid re-running

    // --- *** MAJORLY SIMPLIFIED CAPTURE HANDLER (No Azure) *** ---
    const handleCapture = async () => {
        if (!videoRef.current) return; // Guard clause

        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    setError("Failed to create image blob.");
                    setScanState("idle");
                    return;
                }

                const url = URL.createObjectURL(blob);
                setCapturedImage({ url });
                setScanState("captured");
                stopCamera();
                setIsLoading(true); // Show loading overlay

                try {
                    setLoadingMessage("Preparing face data...");
                    const base64Image = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        // Get result with data prefix (e.g., "data:image/jpeg;base64,...")
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });

                    // --- THIS IS THE ONLY CALL YOU NEED ---
                    setLoadingMessage("Registering face with Luxand...");
                    console.log("[FaceRecord] Calling apiService.registerLuxandFace...");

                    const result = await apiService.registerLuxandFace(
                        instructor.ins_id,
                        base64Image // Send full base64 string with prefix
                    );

                    console.log('[FaceRecord] 🎉 Face Registered. Result:', result);

                    // Get IDs from the final database record
                    const newFaceUuid = result.database_record.face_uuid;
                    const newSubjectId = result.database_record.luxand_subject_id;

                    setRegisteredFaceUuid(newFaceUuid); // Use this for the "Confirm" button
                    setLuxandSubjectId(newSubjectId); // Save for navigation
                    setLoadingMessage("Registration successful!");

                } catch (apiError) {
                    console.error('[FaceRecord] ❌ Process Error:', apiError);
                    setError(`Registration failed: ${apiError.message}`);
                    setScanState("idle"); // Reset to allow retry
                } finally {
                    setIsLoading(false);
                }

            }, "image/jpeg", 0.9); // Use jpeg for smaller file size

        } catch (error) {
            console.error('Error capturing image:', error);
            setError('Failed to capture image');
            setScanState("idle"); // Reset
        }
    };

    // --- Unchanged ---
    const handleRetake = () => {
        setCapturedImage(null);
        setRegisteredFaceUuid(null);
        setLuxandSubjectId(null);
        setProgress(0);
        setScanState("idle");
        setError(null);
        startCamera();
    };

    // --- Updated handleComplete ---
    const handleComplete = async () => {
        if (!registeredFaceUuid) {
            setError('No face data captured.');
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Finalizing...");

        setTimeout(() => {
            navigate("/mod-panel", { // Or wherever you came from
                state: {
                    message: `Face registration completed for ${instructor.ins_fname} ${instructor.ins_lname}`,
                    faceUuid: registeredFaceUuid,
                    instructorId: instructor.ins_id,
                    personId: luxandSubjectId, // Use the Luxand Subject ID
                }
            });
        }, 1500); // Short delay to read message
    };

    // --- Unchanged ---
    const handleReturn = () => {
        if (capturedImage || registeredFaceUuid) {
            if (!window.confirm("Discard captured face data?")) return;
        }
        stopCamera();
        navigate('/instructor-face-selection'); // Or your "back" route
    };

    // --- Unchanged ---
    const ErrorDisplay = () => (
        error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                    <FaExclamationTriangle className="flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
                {error.includes('Camera') && (
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

    // --- Updated ExistingFacesInfo ---
    const ExistingFacesInfo = () => (
        existingFaces.length > 0 && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700">
                    <FaExclamationTriangle className="flex-shrink-0" />
                    <div>
                        <p className="font-medium">Existing Face Registration Found</p>
                        <p className="text-sm">
                            {existingFaces.length} active face(s) found.
                            A new registration will replace them.
                        </p>
                    </div>
                </div>
            </div>
        )
    );

    // --- Unchanged Loading State ---
    if (!instructor && !error) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <ModeratorNavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">{loadingMessage}</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- JSX (Main Render) ---
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <ModeratorNavBar />
            <div className="flex-1 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={handleReturn} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition">
                            <FaArrowLeft /> Back
                        </button>
                        {/* --- Changed Title --- */}
                        <h1 className="text-2xl font-bold text-gray-800">Luxand Face Registration</h1>
                        <div className="w-20"></div>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                        <ErrorDisplay />
                        <ExistingFacesInfo />

                        {instructor && scanState !== "captured" ? (
                            <>
                                {/* --- Instructor Info Card (Unchanged) --- */}
                                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-gray-800">
                                    <h3 className="text-xl font-bold mb-2">
                                        {instructor.ins_fname} {instructor.ins_lname}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                                        <p><strong>ID:</strong> {instructor.ins_id}</p>
                                        <p><strong>Dept:</strong> {instructor.ins_dept}</p>
                                        <p><strong>Age:</strong> {calculateAge(instructor.ins_dob)}</p>
                                        <p className="flex items-center gap-1">
                                            <strong>Sex:</strong>
                                            {instructor.ins_sex?.startsWith('M') ? <FaMale className="text-blue-500"/> : <FaFemale className="text-pink-500"/>}
                                            {instructor.ins_sex}
                                        </p>
                                    </div>
                                </div>

                                {/* --- Camera View (Unchanged) --- */}
                                <div className="relative w-full max-w-md mx-auto aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
                                    <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />
                                    {!isCameraReady && !isLoading && !error &&(
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4 text-center">
                                            Waiting for camera...
                                        </div>
                                    )}
                                    {scanState === "scanning" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                            <div className="text-white text-xl font-semibold">Capturing... {progress}%</div>
                                        </div>
                                    )}
                                </div>

                                {/* --- Capture Button (Unchanged) --- */}
                                {scanState === "idle" && (
                                    <button
                                        onClick={handleBeginScan}
                                        disabled={!isCameraReady || isLoading}
                                        className="w-full py-4 rounded-lg text-white font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-3 text-xl"
                                    >
                                        <FaCamera /> Capture Face
                                    </button>
                                )}
                            </>
                        ) : instructor ? (
                            <>
                                {/* --- Confirmation Screen (Updated disabled state) --- */}
                                <div className="text-center mb-6">
                                    <div className="inline-block p-4 bg-green-100 rounded-full text-green-600 mb-4">
                                        <FaCheck size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Capture Successful!</h3>
                                    <p className="text-gray-600">Face data is ready to be registered.</p>
                                </div>

                                <div className="flex justify-center mb-8">
                                    {capturedImage?.url && (
                                        <img src={capturedImage.url} alt="Captured" className="w-48 h-48 object-cover rounded-lg shadow-lg border-4 border-white" />
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={handleComplete} disabled={!registeredFaceUuid} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition">
                                        Confirm & Finish
                                    </button>
                                    <button onClick={handleRetake} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition">
                                        Retake
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
            {/* --- Loading Overlay (Unchanged) --- */}
            {isLoading && <FaceLoadingOverlay message={loadingMessage} />}
        </div>
    );
};

export default FaceRecord;