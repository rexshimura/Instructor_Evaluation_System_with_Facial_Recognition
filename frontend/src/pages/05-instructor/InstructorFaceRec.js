// src/InstructorFaceRec.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUserCircle,
    FaSearch,
    FaSync,
    FaExclamationTriangle,
    FaCamera,
    FaIdCard,
    FaUsers,
    FaQrcode
} from "react-icons/fa";
import VerifyNavBar from "../../components/module_layout/VerifyNavBar";
import { apiService } from "../../services/apiService";

export default function InstructorFaceRec() {
    // State Hooks
    const [selectedInstructorID, setSelectedInstructorID] = useState("");
    const [instructors, setInstructors] = useState([]);
    const [filteredInstructors, setFilteredInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [retryCount, setRetryCount] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);
    const [faceRecognitionLoading, setFaceRecognitionLoading] = useState(false);
    const [showManualSearch, setShowManualSearch] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [detectedFaces, setDetectedFaces] = useState([]);
    const [scanningStatus, setScanningStatus] = useState("ready");

    // Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Router
    const navigate = useNavigate();

    // Data Fetching
    const fetchInstructors = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getInstructors();
            if (!Array.isArray(data)) throw new Error("Invalid data format received from server");
            setInstructors(data);
            setFilteredInstructors(data);
        } catch (err) {
            console.error("Error fetching instructors:", err);
            setError(err.message || "Failed to load instructors.");
        } finally {
            setLoading(false);
        }
    };

    // Effect for Initial Data Load
    useEffect(() => {
        fetchInstructors();
    }, [retryCount]);

    // Effect for Filtering Instructors
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredInstructors(instructors);
        } else {
            const filtered = instructors.filter(instructor =>
                `${instructor.ins_fname} ${instructor.ins_lname} ${instructor.ins_dept} ${instructor.ins_id}`
                    .toLowerCase().includes(searchTerm.toLowerCase().trim())
            );
            setFilteredInstructors(filtered);
        }
    }, [searchTerm, instructors]);

    // Face Recognition Logic
    const startFaceRecognition = async () => {
        try {
            setFaceRecognitionLoading(true);
            setScanningStatus("scanning");
            setError(null);
            setDetectedFaces([]);

            const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } });
            setCameraStream(stream);
            if (videoRef.current) videoRef.current.srcObject = stream;

            startContinuousFaceDetection();
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Camera access denied.");
            setFaceRecognitionLoading(false);
            setScanningStatus("ready");
            setShowManualSearch(true);
        }
    };

    // Face Detection Loop
    const startContinuousFaceDetection = () => {
        const detectInterval = setInterval(async () => {
            if (!videoRef.current || scanningStatus === "recognized") {
                clearInterval(detectInterval);
                return;
            }
            try {
                await captureAndIdentify();
            } catch (error) {
                console.error("Recognition cycle error:", error);
            }
        }, 2000);
    };

    // Image Capture and API Call
    const captureAndIdentify = async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

            const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            const result = await apiService.identifyFace(base64Image);

            if (result.success && result.matches.length > 0) {
                const match = result.matches[0];
                console.log("✅ Azure Identified:", match.name, "ID:", match.userData);

                setScanningStatus("recognized");

                const instructor = instructors.find(ins => ins.ins_id.toString() === match.userData);

                if (instructor) {
                    setTimeout(() => {
                        setFaceRecognitionLoading(false);
                        stopCamera();
                        navigate(`/instructor-profile/${instructor.ins_id}`, {
                            state: {
                                recognized: true,
                                method: 'face_recognition',
                                confidence: match.confidence,
                                personId: match.personId
                            }
                        });
                    }, 1500);
                } else {
                    setError("Face recognized by Azure, but instructor data not found locally.");
                }
            } else {
                setScanningStatus("scanning");
            }

        } catch (error) {
            console.error("Azure identification error:", error);
        }
    };

    // Utility Functions
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        if (videoRef.current) videoRef.current.srcObject = null;
    };

    // Render
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <VerifyNavBar />
            {/* ... rest of your UI ... */}
        </div>
    );
}