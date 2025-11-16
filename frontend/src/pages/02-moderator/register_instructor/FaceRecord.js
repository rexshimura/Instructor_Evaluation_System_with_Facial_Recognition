import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaMale, FaFemale, FaCamera, FaCheck, FaRedo, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
// Make sure these import paths are correct for your project structure
import { calculateAge } from "../../../utils/ageCalculator";
import { FaceLoadingOverlay } from "../../../components/module_feedback/FaceLoadingOverlay";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { apiService } from "../../../services/apiService";

const FaceRecord = () => {
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const { instructorID } = useParams();

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Initializing...");
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [instructor, setInstructor] = useState(null);
    const [existingFaces, setExistingFaces] = useState([]);

    const [luxandSubjectId, setLuxandSubjectId] = useState(null);
    const [registeredFaceUuid, setRegisteredFaceUuid] = useState(null);

    const [scanState, setScanState] = useState("idle");
    const [progress, setProgress] = useState(0);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);

    // --- Helper to stop camera ---
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach((t) => t.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraReady(false);
    };

    // --- Start Camera Function ---
    const startCamera = useCallback(async () => {
        if (!instructor) return;

        try {
            setIsLoading(true);
            setLoadingMessage("Starting camera...");
            setError(null);
            console.log("[startCamera] Requesting video stream...");

            // Flexible constraints to avoid hardware locks
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            });

            console.log("[startCamera] Stream received:", stream.id);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Force play to ensure video starts
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

    // --- INITIALIZATION EFFECT ---
    useEffect(() => {
        const loadData = async () => {
            if (!instructorID) return;

            try {
                setIsLoading(true);
                setLoadingMessage("Loading instructor data...");

                const instructorData = await apiService.getInstructorById(instructorID);
                setInstructor(instructorData);

                try {
                    const facesData = await apiService.getInstructorFaces(instructorID);
                    setExistingFaces(facesData.faces || []);
                } catch (faceError) {
                    console.warn("No existing faces found (normal).");
                }
            } catch (error) {
                console.error("Init Error:", error);
                setError("Failed to load data.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [instructorID]);

    // --- CAMERA TRIGGER EFFECT (THE FIX IS HERE) ---
    useEffect(() => {
        // Only start if we have an instructor and camera is NOT ready yet.
        // We REMOVED 'isLoading' and 'error' from the dependency array below.
        if (instructor && !isCameraReady) {
            startCamera();
        }

        // Cleanup on unmount
        return () => {
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instructor]); // Only re-run if instructor changes.

    // --- Capture Handler ---
    const handleCapture = useCallback(async () => {
        if (!videoRef.current) return;

        try {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const url = URL.createObjectURL(blob);
                setCapturedImage({ url });
                setScanState("captured");
                stopCamera(); // Stop video stream after capture
                setIsLoading(true);

                try {
                    setLoadingMessage("Registering face with Luxand...");

                    const base64Image = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });

                    const result = await apiService.registerLuxandFace(
                        instructor.ins_id,
                        base64Image
                    );

                    setRegisteredFaceUuid(result.database_record.face_uuid);
                    setLuxandSubjectId(result.database_record.luxand_subject_id);
                    setLoadingMessage("Registration successful!");

                } catch (apiError) {
                    console.error("Registration error:", apiError);
                    setError(`Registration failed: ${apiError.message}`);
                    setScanState("idle");
                } finally {
                    setIsLoading(false);
                }
            }, "image/jpeg", 0.9);

        } catch (error) {
            console.error("Capture error:", error);
            setError("Failed to capture image");
            setScanState("idle");
        }
    }, [instructor]);

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

    // --- Handlers ---
    const handleBeginScan = () => {
        setError(null);
        setScanState("scanning");
        setProgress(0);
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setRegisteredFaceUuid(null);
        setLuxandSubjectId(null);
        setProgress(0);
        setScanState("idle");
        setError(null);
        startCamera(); // Restart camera
    };

    const handleComplete = () => {
        setIsLoading(true);
        setLoadingMessage("Finalizing...");
        setTimeout(() => {
            navigate("/mod-panel", {
                state: {
                    message: `Face registered for ${instructor.ins_fname}`,
                    faceUuid: registeredFaceUuid,
                    instructorId: instructor.ins_id
                }
            });
        }, 1000);
    };

    const handleReturn = () => {
        stopCamera();
        navigate('/instructor-face-selection');
    };

    // --- Render ---
    if (!instructor && !error) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <ModeratorNavBar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-600">Loading...</p>
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
                        <h1 className="text-2xl font-bold text-gray-800">Luxand Face Registration</h1>
                        <div className="w-20"></div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-xl">
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                                <FaExclamationTriangle /> {error}
                                {error.includes('Camera') && <button onClick={startCamera} className="ml-auto underline">Retry</button>}
                            </div>
                        )}

                        {existingFaces.length > 0 && (
                            <div className="mb-4 p-3 bg-orange-50 text-orange-700 rounded-lg text-sm">
                                Note: {existingFaces.length} existing face(s) will be replaced.
                            </div>
                        )}

                        {instructor && scanState !== "captured" && (
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

                        {scanState === "captured" && (
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Capture Successful!</h3>
                                {capturedImage && (
                                    <img src={capturedImage.url} alt="Captured" className="w-48 h-48 object-cover rounded-lg shadow-md mx-auto mb-6 border-4 border-white" />
                                )}
                                <div className="flex gap-4">
                                    <button onClick={handleComplete} disabled={!registeredFaceUuid} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
                                        Confirm
                                    </button>
                                    <button onClick={handleRetake} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300">
                                        Retake
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isLoading && <FaceLoadingOverlay message={loadingMessage} />}
        </div>
    );
};

export default FaceRecord;