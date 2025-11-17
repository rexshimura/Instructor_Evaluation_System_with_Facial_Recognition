import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaceLivenessDetector,
} from "@aws-amplify/ui-react-liveness";
import { Loader } from "@aws-amplify/ui-react";
import { FaCheck, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import "@aws-amplify/ui-react/styles.css";

import { FaceLoadingOverlay } from "../../../components/module_feedback/FaceLoadingOverlay";
import ModeratorNavBar from "../../../components/module_layout/ModeratorNavBar";
import { apiService } from "../../../services/apiService";

// Using port 5000 and prefix /rekognition
const BACKEND_URL_REGISTRATION = process.env.REACT_APP_API_URL || "http://localhost:5000/rekognition";

const FaceRecord = () => {
    const navigate = useNavigate();
    const { instructorID } = useParams();

    // --- State ---
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("Initializing...");
    const [instructor, setInstructor] = useState(null);
    const [sessionId, setSessionId] = useState(null);

    // UI/Capture state
    const [scanState, setScanState] = useState("idle"); // idle, registering, success, error
    const [error, setError] = useState(null);
    const [awsFaceId, setAwsFaceId] = useState(null);
    const [createdBy, setCreatedBy] = useState("mod_system"); // Moderator ID input

    // --- Data Loading Effect (Load Instructor Profile) ---
    useEffect(() => {
        const loadData = async () => {
            if (!instructorID) return;
            try {
                setIsLoading(true);
                setLoadingMessage("Loading instructor data...");
                const instructorData = await apiService.getInstructorById(instructorID);
                setInstructor(instructorData);
                setIsLoading(false);
            } catch (error) {
                console.error("Init Error:", error);
                setError("Failed to load instructor data.");
                setIsLoading(false);
            }
        };
        loadData();
    }, [instructorID]);


    /**
     * STEP 1: Start Liveness Session (Create the Session ID)
     * This is called when the moderator clicks "Start Registration Scan".
     */
    const handleStartRegistration = async () => {
        if (!instructorID || !createdBy) {
            setError("Missing Instructor ID or Moderator ID.");
            return;
        }

        setIsLoading(true);
        setLoadingMessage("Creating secure Liveness session...");
        setError(null);

        try {
            // Reuses the verification endpoint to create the session ID
            const response = await fetch(`${BACKEND_URL_REGISTRATION}/create-liveness-session`, {
                method: "GET",
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.details || "Failed to create session");
            }

            const data = await response.json();
            setSessionId(data.sessionId);
            setScanState("registering"); // Start the detector UI
            setLoadingMessage(""); // Clear message for Liveness UI
        } catch (error) {
            console.error("Error creating session:", error);
            setError(`Error starting liveness check: ${error.message}`);
            setScanState("error");
        }
        setIsLoading(false);
    };

    /**
     * STEP 2: Handle Analysis Completion (Index the Face)
     * This is called by the <FaceLivenessDetector> when the video feed is done.
     */
    const handleAnalysisComplete = async () => {
        setScanState("idle");
        setIsLoading(true);
        setLoadingMessage("Processing Liveness results and registering face...");

        try {
            const response = await fetch(`${BACKEND_URL_REGISTRATION}/register-face-liveness`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: sessionId,
                    ins_id: instructorID,
                    created_by: createdBy
                }),
            });

            const data = await response.json();
            console.log("📋 Registration API Response:", { status: response.status, data });

            if (response.ok) {
                console.log("[AWS Registration] Success:", data);
                setAwsFaceId(data.awsFaceId);
                setScanState("success");
                setLoadingMessage("Face registered successfully!");
            } else {
                console.error("[AWS Registration] Fail:", data);
                setError(data.error || data.details || "Failed to register face. Please try again.");
                setScanState("error");
            }
        } catch (apiError) {
            console.error("Registration error:", apiError);
            setError(`Registration failed: ${apiError.message}`);
            setScanState("error");
        } finally {
            setIsLoading(false);
            setSessionId(null);
        }
    };

    /**
     * Handle errors coming directly from the Liveness component
     */
    const handleLivenessError = (err) => {
        console.error("Liveness component error:", err);
        setError(`Liveness Error: ${err.message}. Please restart.`);
        setScanState("error");
        setIsLoading(false);
        setSessionId(null);
    };


    const handleComplete = () => {
        navigate("/mod-panel", {
            state: {
                message: `Face registered for ${instructor.ins_fname}`,
                instructorId: instructor.ins_id
            }
        });
    };

    const handleReturn = () => {
        navigate('/instructor-face-selection');
    };

    const handleRetry = () => {
        setScanState("idle");
        setError(null);
        setSessionId(null);
        setAwsFaceId(null);
    }

    // --- Render ---
    if (!instructor) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                <ModeratorNavBar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader size="large" />
                    <FaceLoadingOverlay message={loadingMessage || "Loading..."} />
                </div>
            </div>
        );
    }

    // Display the Liveness Detector component
    if (scanState === "registering" && sessionId) {
        return (
            <FaceLivenessDetector
                sessionId={sessionId}
                region="us-east-1"
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleLivenessError}
                config={{ "face-liveness-detector": { showStartScreen: false } }}
            />
        );
    }


    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <ModeratorNavBar />
            <div className="flex-1 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={handleReturn} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                            <FaArrowLeft /> Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Enrollment Liveness</h1>
                        <div className="w-20"></div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-xl">

                        {/* Instructor Info */}
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-bold text-xl">{instructor.ins_fname} {instructor.ins_lname}</h3>
                            <p className="text-sm text-gray-600">ID to register: {instructor.ins_id}</p>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 font-medium">
                                <FaExclamationTriangle /> {error}
                                <button onClick={handleRetry} className="ml-auto underline text-sm">Retry</button>
                            </div>
                        )}

                        {/* --- STATE: SUCCESS --- */}
                        {scanState === "success" && (
                            <div className="text-center">
                                <div className="inline-block p-4 bg-green-100 rounded-full text-green-600 mb-4">
                                    <FaCheck size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Liveness Registered!</h3>
                                <p className="text-gray-600 mb-4">
                                    Successfully created a secure face reference for verification.
                                </p>
                                <p className="text-sm text-gray-500 mb-6">AWS Face ID: {awsFaceId}</p>
                                <button onClick={handleComplete} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                                    Finish & Return
                                </button>
                            </div>
                        )}

                        {/* --- STATE: IDLE / START --- */}
                        {scanState === "idle" && (
                            <>
                                <p className="text-gray-600 mb-4">
                                    This process captures a secure, anti-spoofing reference image for future logins.
                                </p>
                                <div className="mb-6">
                                    <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700 mb-1 text-left">
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
                                <button
                                    onClick={handleStartRegistration}
                                    disabled={!instructorID || !createdBy}
                                    className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Start Registration Scan
                                </button>
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