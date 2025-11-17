import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaceLivenessDetector,
} from "@aws-amplify/ui-react-liveness";
import { Loader } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

// This is the URL of your Node.js backend
// Updated to use the correct /rekognition prefix and port 5000.
const BACKEND_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/rekognition";

/**
 * This component handles the instructor face verification process.
 * It's loaded by React Router at the "/verify-instructor" path.
 */
function InstructorFaceRec() {
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [showLiveness, setShowLiveness] = useState(false);
    const navigate = useNavigate();

    /**
     * STEP 1: Create a liveness session
     * This calls your 'GET /create-liveness-session' endpoint
     */
    const handleStartLivenessCheck = async () => {
        setLoading(true);
        setVerificationResult(null);
        try {
            // Calls http://localhost:5000/rekognition/create-liveness-session
            const response = await fetch(`${BACKEND_URL}/create-liveness-session`, {
                method: "GET",
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.details || "Failed to create session");
            }

            const data = await response.json();
            setSessionId(data.sessionId);
            setShowLiveness(true); // Show the detector component

        } catch (error) {
            console.error("Error creating session:", error);
            setVerificationResult({
                status: "error",
                message: `Error: ${error.message}`,
            });
        }
        setLoading(false);
    };

    /**
     * STEP 2: Handle the analysis completion
     * This calls your 'POST /get-verification-result' endpoint
     */
    const handleAnalysisComplete = async () => {
        setShowLiveness(false); // Hide the detector
        setLoading(true);
        try {
            // Calls http://localhost:5000/rekognition/get-verification-result
            const response = await fetch(`${BACKEND_URL}/get-verification-result`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ sessionId: sessionId }),
            });

            const data = await response.json();

            if (response.ok && data.isMatch) {
                setVerificationResult({
                    status: "success",
                    message: `Welcome, ${data.instructor.ins_fname} ${data.instructor.ins_lname}!`,
                    details: `Match Confidence: ${data.confidence.toFixed(2)}%`,
                });

                // --- LOGGING THE VERIFIED USER HERE ---
                console.log("✅ Instructor Verified:", data.instructor);
                // ------------------------------------

                // On success, navigate to their profile page after a short delay
                setTimeout(() => {
                    navigate(`/instructor-profile/${data.instructor.ins_id}`);
                }, 3000); // Wait 3 seconds before redirecting

            } else {
                setVerificationResult({
                    status: "error",
                    message: data.error || "Verification Failed. Please try again.",
                });
            }

        } catch (error) {
            console.error("Error getting session results:", error);
            setVerificationResult({
                status: "error",
                message: "Error getting results from server.",
            });
        }
        setLoading(false);
        setSessionId(null); // Reset session
    };

    /**
     * Handle any errors from the liveness component itself
     */
    const handleError = (error) => {
        console.error("Liveness check error:", error);
        setVerificationResult({
            status: "error",
            message: `Liveness Error: ${error.message}`,
        });
        setLoading(false);
        setShowLiveness(false);
        setSessionId(null);
    };

    // Helper to render the result message
    const renderResult = () => {
        if (!verificationResult) return null;

        const isSuccess = verificationResult.status === 'success';

        return (
            <div style={{ marginTop: '20px' }}>
                <h2 style={{ color: isSuccess ? "green" : "red" }}>
                    {verificationResult.message}
                </h2>
                {verificationResult.details && (
                    <p>{verificationResult.details}</p>
                )}
                {isSuccess && (
                    <p>Redirecting to your profile...</p>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: "40px", textAlign: "center", maxWidth: "600px", margin: "auto" }}>
            <h1>Instructor Verification</h1>
            <p>Please complete a quick liveness check to verify your identity.</p>

            {loading && <Loader />}

            {!loading && !showLiveness && (
                <>
                    <button
                        onClick={handleStartLivenessCheck}
                        style={{ fontSize: "1.2rem", padding: "10px 20px" }}
                    >
                        Start Verification
                    </button>
                    {renderResult()}
                </>
            )}

            {showLiveness && sessionId && (
                <FaceLivenessDetector
                    sessionId={sessionId}
                    region="us-east-1" // Make sure this matches your backend region
                    onAnalysisComplete={handleAnalysisComplete}
                    onError={handleError}
                    config={{
                        "face-liveness-detector": {
                            showStartScreen: false // Skips the "Get ready" screen
                        }
                    }}
                />
            )}
        </div>
    );
}

export default InstructorFaceRec;