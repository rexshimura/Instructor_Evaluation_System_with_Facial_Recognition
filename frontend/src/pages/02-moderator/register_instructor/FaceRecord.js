import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import {
    FaCheckCircle,
    FaExclamationTriangle,
    FaUserPlus,
    FaCamera,
    FaTimes,
    FaUserShield,
    FaIdBadge
} from "react-icons/fa";
import "@aws-amplify/ui-react/styles.css";

import { FaceLoadingOverlay } from "../../../components/module_feedback/FaceLoadingOverlay";
import { apiService } from "../../../services/apiService";

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

    // Moderator ID is now static state (Read-Only)
    const [createdBy] = useState("mod_system");

    // --- Safety Cleanup ---
    useEffect(() => {
        return () => {
            setSessionId(null);
            setScanState("idle");
        };
    }, []);

    // --- Data Loading ---
    useEffect(() => {
        const loadData = async () => {
            if (!instructorID) return;
            try {
                setIsLoading(true);
                setLoadingMessage("Loading instructor profile...");
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

    // --- Handlers ---

    const handleStartRegistration = async () => {
        setIsLoading(true);
        setLoadingMessage("Initializing secure session...");
        setError(null);

        try {
            const response = await fetch(`${BACKEND_URL_REGISTRATION}/create-liveness-session`, {
                method: "GET",
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.details || "Failed to create session");
            }

            const data = await response.json();
            setSessionId(data.sessionId);
            setScanState("registering"); // Opens the Modal
            setLoadingMessage("");
        } catch (error) {
            console.error("Error creating session:", error);
            setError(`Connection Error: ${error.message}`);
            setScanState("error");
        }
        setIsLoading(false);
    };

    const handleAnalysisComplete = async () => {
        // Close modal UI immediately
        setScanState("processing");
        setIsLoading(true);
        setLoadingMessage("Analyzing biometrics & registering face...");

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

            if (response.ok) {
                setAwsFaceId(data.awsFaceId);
                setScanState("success");
            } else {
                setError(data.error || "Face registration failed. Please ensure the face is visible.");
                setScanState("error");
            }
        } catch (apiError) {
            setError(`Network Error: ${apiError.message}`);
            setScanState("error");
        } finally {
            setIsLoading(false);
            setSessionId(null);
        }
    };

    const handleLivenessError = (err) => {
        console.error("Liveness error:", err);
        setError(`Scan failed: ${err.message}. Please try again.`);
        setScanState("error");
        setIsLoading(false);
        setSessionId(null);
    };

    const handleCancelScan = () => {
        setScanState("idle");
        setSessionId(null);
        setIsLoading(false);
    };

    const handleComplete = () => {
        navigate("/mod-panel", {
            state: {
                message: `Successfully registered face for ${instructor.ins_fname}`,
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

    // --- UI RENDER ---

    if (!instructor && isLoading) {
        return <FaceLoadingOverlay message={loadingMessage} />;
    }

    if (!instructor) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center justify-center p-4">

            {/* Main Card */}
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative z-10">

                {/* Top Right Circular Close Button */}
                <button
                    onClick={handleReturn}
                    className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200 z-10"
                    title="Cancel & Return"
                >
                    <FaTimes size={20} />
                </button>

                <div className="p-8 pb-4">

                    {/* Title Section */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-4 shadow-sm">
                            <FaUserPlus className="text-2xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Enroll Instructor Face
                        </h1>
                        <p className="text-slate-500 text-sm mt-2">
                            Create a secure biometric profile for this instructor.
                        </p>
                    </div>

                    {/* Instructor Badge */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-slate-100">
                            <FaUserShield className="text-xl" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">
                                {instructor.ins_fname} {instructor.ins_lname}
                            </h3>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                                ID: {instructor.ins_id}
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-start gap-3 text-sm animate-fade-in">
                            <FaExclamationTriangle className="mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold">Registration Error</p>
                                <p>{error}</p>
                            </div>
                            <button onClick={handleRetry} className="text-red-800 underline font-medium hover:text-red-900">
                                Retry
                            </button>
                        </div>
                    )}

                    {/* --- STATE: SUCCESS --- */}
                    {scanState === "success" ? (
                        <div className="text-center space-y-6 animate-fade-in mb-6">
                            <div className="flex justify-center">
                                <FaCheckCircle className="text-6xl text-green-500 drop-shadow-sm animate-bounce-short" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Registration Complete!</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Face data has been securely indexed.
                                </p>
                            </div>
                            <button
                                onClick={handleComplete}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                            >
                                Return to Panel
                            </button>
                        </div>
                    ) : (
                        /* --- STATE: IDLE --- */
                        <div className="space-y-6 mb-6">
                            {/* Start Button */}
                            <button
                                onClick={handleStartRegistration}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                            >
                                <FaCamera /> Start Registration Scan
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer: Read-Only Moderator Info */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <FaIdBadge className="text-slate-400" />
                        <span className="font-semibold uppercase tracking-wide">Authorized By:</span>
                    </div>
                    <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200">
                        {createdBy}
                    </span>
                </div>
            </div>

            {/* --- LIVENESS MODAL (Overlay) --- */}
            {scanState === "registering" && sessionId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
                    <div className="w-full max-w-xl relative animate-scale-in">
                        {/* Close/Cancel Button */}
                        <button
                            onClick={handleCancelScan}
                            className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm"
                        >
                            Cancel Registration <FaTimes />
                        </button>

                        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700 ring-4 ring-black/50 relative">
                            <FaceLivenessDetector
                                sessionId={sessionId}
                                region="us-east-1"
                                onAnalysisComplete={handleAnalysisComplete}
                                onError={handleLivenessError}
                                onUserCancel={handleCancelScan}
                                config={{
                                    "face-liveness-detector": {
                                        showStartScreen: false,
                                        instructionTextColor: "white",
                                    }
                                }}
                            />
                        </div>
                        <p className="text-center text-white/50 text-sm mt-6">
                            Ensure the instructor is facing the camera directly.
                        </p>
                    </div>
                </div>
            )}

            {/* Loading Overlay (for API calls) */}
            {isLoading && <FaceLoadingOverlay message={loadingMessage} />}
        </div>
    );
};

export default FaceRecord;