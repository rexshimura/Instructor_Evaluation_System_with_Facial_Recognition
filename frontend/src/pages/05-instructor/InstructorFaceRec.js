import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import { Loader } from "@aws-amplify/ui-react";
import {
    FaCheckCircle,
    FaExclamationCircle,
    FaTimes,
    FaUserShield,
    FaCamera,
    FaRedo
} from "react-icons/fa";
import "@aws-amplify/ui-react/styles.css";

const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/rekognition";

function InstructorFaceRec() {
    // ==========================================
    // LOGIC SECTION (Unchanged)
    // ==========================================
    const [instructorID, setInstructorID] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [showLiveness, setShowLiveness] = useState(false);
    const navigate = useNavigate();

    const handleStartLivenessCheck = async () => {
        if (!instructorID.trim()) {
            setVerificationResult({
                status: "error",
                message: "Please enter your Instructor ID first."
            });
            return;
        }

        setLoading(true);
        setVerificationResult(null);
        try {
            const response = await fetch(`${BACKEND_URL}/create-liveness-session`, {
                method: "GET",
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.details || "Failed to create session");
            }

            const data = await response.json();
            setSessionId(data.sessionId);
            setShowLiveness(true);

        } catch (error) {
            console.error("Error creating session:", error);
            setVerificationResult({
                status: "error",
                message: `Error starting verification: ${error.message}`,
            });
            setLoading(false);
        }
    };

    const handleAnalysisComplete = async () => {
        setShowLiveness(false);
        setLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/get-verification-result`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    instructorID: instructorID
                }),
            });

            const data = await response.json();

            if (response.ok && data.isMatch) {
                setVerificationResult({
                    status: "success",
                    message: `Welcome, ${data.instructor.ins_fname} ${data.instructor.ins_lname}!`,
                    details: `Match Confidence: ${data.confidence.toFixed(2)}%`,
                    instructor: data.instructor
                });

                setTimeout(() => {
                    navigate(`/instructor-profile/${data.instructor.ins_id}`);
                }, 3000);

            } else {
                setVerificationResult({
                    status: "error",
                    message: data.error || "Verification failed. Please try again.",
                    details: data.details || ''
                });
            }

        } catch (error) {
            setVerificationResult({
                status: "error",
                message: "Network error. Please check your connection and try again.",
            });
        }

        setLoading(false);
        setSessionId(null);
    };

    const handleError = (error) => {
        console.error("Liveness component error:", error);
        setVerificationResult({
            status: "error",
            message: `Liveness check failed: ${error.message}. Please try again.`,
        });
        setLoading(false);
        setShowLiveness(false);
        setSessionId(null);
    };

    const handleRetry = () => {
        setVerificationResult(null);
        setInstructorID("");
        setSessionId(null);
        setShowLiveness(false);
    };

    const handleBack = () => {
        navigate(-1);
    };

    // ==========================================
    // UI SECTION
    // ==========================================

    const renderResult = () => {
        if (!verificationResult) return null;

        const isSuccess = verificationResult.status === 'success';

        return (
            <div className={`mt-8 p-6 rounded-xl border text-center transition-all duration-300 ${
                isSuccess 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
            }`}>
                <div className="flex justify-center mb-4">
                    {isSuccess ? (
                        <FaCheckCircle className="text-4xl text-green-600" />
                    ) : (
                        <FaExclamationCircle className="text-4xl text-red-600" />
                    )}
                </div>

                <h2 className="text-lg font-bold mb-2">
                    {verificationResult.message}
                </h2>

                {verificationResult.details && (
                    <p className={`text-sm mb-4 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                        {verificationResult.details}
                    </p>
                )}

                {isSuccess ? (
                    <div className="flex flex-col items-center mt-4">
                        <div className="w-full max-w-[200px] bg-green-200 rounded-full h-1.5">
                            <div className="bg-green-600 h-1.5 rounded-full" style={{width: '100%'}}></div>
                        </div>
                        <span className="text-xs text-green-600 mt-2 font-medium">Redirecting to profile...</span>
                    </div>
                ) : (
                    <div className="flex gap-3 justify-center mt-4">
                        <button
                            onClick={handleRetry}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition shadow-sm font-medium text-sm"
                        >
                            <FaRedo className="text-xs" /> Try Again
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col items-center justify-center p-4">

            {/* Main Content Card */}
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative">

                {/* Top Right Circular Back/Close Button */}
                <button
                    onClick={handleBack}
                    className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all duration-200 z-10"
                    title="Go Back"
                >
                    <FaTimes size={20} />
                </button>

                {/* Card Header */}
                <div className="bg-slate-50 px-8 py-10 text-center border-b border-slate-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-full mb-5">
                        <FaUserShield className="text-3xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Identity Verification
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">
                        Enter your instructor ID to verify your identity
                    </p>
                </div>

                {/* Card Body */}
                <div className="p-8 pb-10">
                    {loading && !showLiveness && !verificationResult ? (
                        <div className="flex flex-col items-center py-8">
                            <Loader size="large" variation="linear" />
                            <p className="text-slate-500 text-sm mt-6 font-medium">
                                Initializing verification...
                            </p>
                        </div>
                    ) : (
                        !loading && !showLiveness && !verificationResult && (
                            <div className="space-y-8">

                                {/* Input Section */}
                                <div className="space-y-3 pt-2">
                                    <label
                                        htmlFor="instructorID"
                                        className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-center"
                                    >
                                        Instructor ID
                                    </label>
                                    <input
                                        type="text"
                                        id="instructorID"
                                        value={instructorID}
                                        onChange={(e) => setInstructorID(e.target.value)}
                                        placeholder="XXXXXXX"
                                        maxLength={15}
                                        className="w-full text-center text-3xl font-mono tracking-[0.3em] text-slate-800 placeholder-slate-200 border-b-2 border-slate-200 py-4 focus:border-blue-600 focus:outline-none bg-transparent transition-colors"
                                    />
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={handleStartLivenessCheck}
                                    disabled={!instructorID.trim()}
                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 mt-4"
                                >
                                    <FaCamera /> Verify Identity
                                </button>
                            </div>
                        )
                    )}

                    {renderResult()}
                </div>
            </div>

            {/* Liveness Modal */}
            {showLiveness && sessionId && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-xl relative">
                        {/* Close Button */}
                        <button
                            onClick={handleRetry}
                            className="absolute -top-12 right-0 text-white/80 hover:text-white text-sm flex items-center gap-2 transition-colors"
                        >
                            Cancel <FaTimes />
                        </button>

                        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative">
                            <FaceLivenessDetector
                                sessionId={sessionId}
                                region="us-east-1"
                                onAnalysisComplete={handleAnalysisComplete}
                                onError={handleError}
                                config={{
                                    "face-liveness-detector": {
                                        showStartScreen: false,
                                        instructionTextColor: "white",
                                    }
                                }}
                            />
                        </div>
                        <p className="text-center text-slate-400 text-sm mt-6">
                            Please center your face in the oval
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InstructorFaceRec;