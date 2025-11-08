import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaMale, FaFemale, FaCamera, FaCheck, FaRedo, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
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
    const [azurePersonId, setAzurePersonId] = useState(null);

    const [scanState, setScanState] = useState("idle");
    const [progress, setProgress] = useState(0);
    const [capturedImage, setCapturedImage] = useState(null);
    const [persistedFaceId, setPersistedFaceId] = useState(null);
    const [error, setError] = useState(null);
    const [isNewFaceRegistered, setIsNewFaceRegistered] = useState(false);

    const instruction = "Look straight into the camera with good lighting.";

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

    // --- DEBUGGED INITIALIZATION EFFECT ---
    useEffect(() => {
        const loadData = async () => {
            if (!instructorID) {
                setError("No instructor selected");
                return;
            }

            try {
                setIsLoading(true);
                setLoadingMessage("Loading instructor data and setting up Azure...");

                // DEBUG LOG 1
                console.log(`[FaceRecord] Fetching data for instructorID: ${instructorID}`);
                const instructorData = await apiService.getInstructorById(instructorID);
                console.log("[FaceRecord] ✅ Instructor data loaded:", instructorData);
                setInstructor(instructorData);

                // DEBUG LOG 2
                console.log("[FaceRecord] Initializing Azure Person Group...");
                await apiService.ensurePersonGroupExists();
                console.log("[FaceRecord] ✅ Azure Person Group initialized.");

                try {
                    console.log("[FaceRecord] Checking existing faces...");
                    const faces = await apiService.getInstructorFaces(instructorID);
                    setExistingFaces(faces.faces || []);
                    if (faces.faces && faces.faces.length > 0) {
                        console.log("[FaceRecord] Found existing Azure Person ID:", faces.faces[0].person_id_azure);
                        setAzurePersonId(faces.faces[0].person_id_azure);
                    }
                } catch (faceError) {
                    console.warn("[FaceRecord] ⚠️ No existing faces found (this is normal for new registrations):", faceError);
                }

                setError(null);
            } catch (error) {
                // CRITICAL DEBUG LOG
                console.error("[FaceRecord] ❌ CRITICAL INITIALIZATION ERROR:", error);
                if (error.response) {
                    console.error("[FaceRecord] Backend Error Response:", error.response.data);
                    console.error("[FaceRecord] Status Code:", error.response.status);
                } else if (error.request) {
                    console.error("[FaceRecord] No response received from backend. Is it running?", error.request);
                } else {
                    console.error("[FaceRecord] Request setup error:", error.message);
                }

                setError("Failed to load data. Check browser console (F12) for details.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [instructorID]);

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
                        handleCapture();
                        return 100;
                    }
                    return prev + 5;
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [scanState]);

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
                stopCamera();

                try {
                    setLoadingMessage("Preparing face data...");

                    const base64Image = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result.split(',')[1]);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });

                    let currentPersonId = azurePersonId;

                    if (!currentPersonId) {
                        setLoadingMessage("Creating new Azure Person...");
                        console.log("[FaceRecord] Calling createAzurePerson...");
                        const personResult = await apiService.createAzurePerson(
                            instructor.ins_id,
                            `${instructor.ins_fname} ${instructor.ins_lname}`
                        );
                        currentPersonId = personResult.personId;
                        setAzurePersonId(currentPersonId);
                        console.log('[FaceRecord] ✅ New Azure Person ID:', currentPersonId);
                    } else {
                        console.log('[FaceRecord] Using existing Azure Person ID:', currentPersonId);
                    }

                    if (!currentPersonId) {
                        throw new Error('Failed to get or create Azure Person ID.');
                    }

                    if (existingFaces.length > 0) {
                        setLoadingMessage("Cleaning up old face data...");
                        console.log("[FaceRecord] Deleting old faces:", existingFaces.length);
                        // Ensure your DB face objects have a 'face_uuid' property that matches Azure's persistedFaceId
                        const faceIdsToDelete = existingFaces.map(f => f.face_uuid).filter(Boolean);
                        if (faceIdsToDelete.length > 0) {
                            await apiService.deletePersonFaces(currentPersonId, faceIdsToDelete);
                        }
                        setExistingFaces([]);
                    }

                    setLoadingMessage("Uploading face to Azure...");
                    console.log("[FaceRecord] Calling addPersonFace...");
                    const addFaceResult = await apiService.addPersonFace(
                        currentPersonId,
                        base64Image
                    );

                    const newPersistedFaceId = addFaceResult.persistedFaceId;
                    console.log('[FaceRecord] 🎉 Azure Face Added. ID:', newPersistedFaceId);

                    if (!newPersistedFaceId) {
                        throw new Error(addFaceResult.message || 'Failed to register face with Azure');
                    }

                    setLoadingMessage("Training recognition model...");
                    console.log("[FaceRecord] Initiating Group Training...");
                    await apiService.trainPersonGroup();
                    console.log('[FaceRecord] ✅ Training initiated.');

                    setLoadingMessage("Saving to database...");
                    try {
                        // Pass the new Person ID to your DB so it can be recalled later
                        await apiService.registerInstructorFace(
                            instructor.ins_id,
                            newPersistedFaceId,
                            currentPersonId,
                            'system'
                        );
                        setIsNewFaceRegistered(true);
                        setPersistedFaceId(newPersistedFaceId);
                    } catch (dbError) {
                        console.error('[FaceRecord] ❌ Database save error:', dbError);
                        setError("Face saved to Azure, but local database update failed.");
                    }

                } catch (azureError) {
                    console.error('[FaceRecord] ❌ Process Error:', azureError);
                    setError(`Registration failed: ${azureError.response?.data?.message || azureError.message}`);
                }

            }, "image/jpeg", 0.9);

        } catch (error) {
            console.error('Error capturing image:', error);
            setError('Failed to capture image');
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setPersistedFaceId(null);
        setProgress(0);
        setScanState("idle");
        setError(null);
        setIsNewFaceRegistered(false);
        startCamera();
    };

    const handleComplete = async () => {
        if (!persistedFaceId) {
            setError('No face data captured.');
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Finalizing...");

        setTimeout(() => {
            navigate("/mod-panel", {
                state: {
                    message: `Face registration completed for ${instructor.ins_fname} ${instructor.ins_lname}`,
                    faceUuid: persistedFaceId,
                    instructorId: instructor.ins_id,
                    personId: azurePersonId,
                }
            });
        }, 1500);
    };

    const handleReturn = () => {
        if (capturedImage || persistedFaceId) {
            if (!window.confirm("Discard captured face data?")) return;
        }
        stopCamera();
        navigate('/instructor-face-selection');
    };

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

    const ExistingFacesInfo = () => (
        existingFaces.length > 0 && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700">
                    <FaExclamationTriangle className="flex-shrink-0" />
                    <div>
                        <p className="font-medium">Existing Face Registration Found</p>
                        <p className="text-sm">
                            {existingFaces.length} existing face(s). New registration will replace them.
                            {azurePersonId && <span className="block text-xs mt-1 opacity-75">Azure Person ID: {azurePersonId}</span>}
                        </p>
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
                        <p className="mt-4 text-gray-600">{loadingMessage}</p>
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
                        <button onClick={handleReturn} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition">
                            <FaArrowLeft /> Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Azure Face Registration</h1>
                        <div className="w-20"></div>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
                        <ErrorDisplay />
                        <ExistingFacesInfo />

                        {instructor && scanState !== "captured" ? (
                            <>
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

                                <div className="relative w-full max-w-md mx-auto aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
                                    <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />
                                    {!isCameraReady && !isLoading && (
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
                                <div className="text-center mb-6">
                                    <div className="inline-block p-4 bg-green-100 rounded-full text-green-600 mb-4">
                                        <FaCheck size={40} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Capture Successful!</h3>
                                    <p className="text-gray-600">Face data is ready to be registered.</p>
                                </div>

                                <div className="flex justify-center mb-8">
                                    <img src={capturedImage?.url} alt="Captured" className="w-48 h-48 object-cover rounded-lg shadow-lg border-4 border-white" />
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={handleComplete} disabled={!persistedFaceId} className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition">
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
            {isLoading && <FaceLoadingOverlay message={loadingMessage} />}
        </div>
    );
};

export default FaceRecord;