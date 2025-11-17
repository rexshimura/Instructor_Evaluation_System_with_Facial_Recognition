import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaceLivenessDetector,
} from "@aws-amplify/ui-react-liveness";
import { Loader } from "@aws-amplify/ui-react";
import { FaCheck, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import "@aws-amplify/ui-react/styles.css";

const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/rekognition";

function InstructorFaceRec() {
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
            console.log("🔄 Creating liveness session...");
            const response = await fetch(`${BACKEND_URL}/create-liveness-session`, {
                method: "GET",
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.details || "Failed to create session");
            }

            const data = await response.json();
            console.log("✅ Session created:", data.sessionId);
            setSessionId(data.sessionId);
            setShowLiveness(true);

        } catch (error) {
            console.error("❌ Error creating session:", error);
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
            console.log("🔄 Getting verification results...");
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
            console.log("📋 Verification API Response:", {
                status: response.status,
                statusText: response.statusText,
                data: data
            });

            if (response.ok && data.isMatch) {
                setVerificationResult({
                    status: "success",
                    message: `Welcome, ${data.instructor.ins_fname} ${data.instructor.ins_lname}!`,
                    details: `Match Confidence: ${data.confidence.toFixed(2)}%`,
                    instructor: data.instructor
                });

                console.log("✅ Instructor Verified:", data.instructor);

                setTimeout(() => {
                    navigate(`/instructor-profile/${data.instructor.ins_id}`);
                }, 3000);

            } else {
                console.error("❌ Verification failed:", data);
                setVerificationResult({
                    status: "error",
                    message: data.error || "Verification failed. Please try again.",
                    details: data.details || ''
                });
            }

        } catch (error) {
            console.error("❌ Error getting results:", error);
            setVerificationResult({
                status: "error",
                message: "Network error. Please check your connection and try again.",
            });
        }

        setLoading(false);
        setSessionId(null);
    };

    const handleError = (error) => {
        console.error("❌ Liveness component error:", error);
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
        navigate(-1); // Go back to previous page
    };

    // Render result with better UI
    const renderResult = () => {
        if (!verificationResult) return null;

        const isSuccess = verificationResult.status === 'success';

        return (
            <div className={`p-6 rounded-lg mt-6 ${
                isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
                <div className="flex items-center gap-3 mb-3">
                    {isSuccess ? (
                        <FaCheck className="text-green-600 text-2xl" />
                    ) : (
                        <FaExclamationTriangle className="text-red-600 text-2xl" />
                    )}
                    <h2 className={`text-xl font-bold ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
                        {verificationResult.message}
                    </h2>
                </div>

                {verificationResult.details && (
                    <p className={`${isSuccess ? 'text-green-700' : 'text-red-700'} mb-3`}>
                        {verificationResult.details}
                    </p>
                )}

                {isSuccess ? (
                    <div className="text-green-700">
                        <p>Redirecting to your profile...</p>
                        <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            Go Back
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navigation */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <FaArrowLeft /> Back
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                        Instructor Verification
                    </h1>
                    <p className="text-gray-600 text-center mb-8">
                        Complete a quick liveness check to verify your identity
                    </p>

                    {loading && (
                        <div className="text-center py-8">
                            <Loader size="large" />
                            <p className="text-gray-600 mt-4">Processing verification...</p>
                        </div>
                    )}

                    {!loading && !showLiveness && !verificationResult && (
                        <>
                            <div className="mb-6">
                                <label htmlFor="instructorID" className="block text-lg font-bold text-gray-700 mb-3 text-left">
                                    Enter Your Instructor ID
                                </label>
                                <input
                                    type="text"
                                    id="instructorID"
                                    value={instructorID}
                                    onChange={(e) => setInstructorID(e.target.value)}
                                    placeholder="e.g., 1020002"
                                    className="w-full p-4 border border-gray-300 rounded-lg text-center text-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                onClick={handleStartLivenessCheck}
                                disabled={loading || !instructorID.trim()}
                                className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-lg"
                            >
                                Start Verification
                            </button>
                        </>
                    )}

                    {renderResult()}

                    {showLiveness && sessionId && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4">
                                <FaceLivenessDetector
                                    sessionId={sessionId}
                                    region="us-east-1"
                                    onAnalysisComplete={handleAnalysisComplete}
                                    onError={handleError}
                                    config={{
                                        "face-liveness-detector": {
                                            showStartScreen: false
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InstructorFaceRec;