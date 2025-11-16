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
    FaCheckCircle,
    FaLock,
    FaRegDotCircle // Icon for the scan button
} from "react-icons/fa";
import VerifyNavBar from "../../components/module_layout/VerifyNavBar";
import { apiService } from "../../services/apiService";

export default function InstructorFaceRec() {
    // --- State Hooks ---
    const [instructors, setInstructors] = useState([]);
    const [filteredInstructors, setFilteredInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Scanning States
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [scanStatus, setScanStatus] = useState("idle"); // idle, processing, success, error
    const [scanMessage, setScanMessage] = useState(""); // To show "No match found" etc.
    const [recognizedInstructor, setRecognizedInstructor] = useState(null);

    // Refs
    const videoRef = useRef(null);

    const navigate = useNavigate();

    // --- 1. Fetch Instructors ---
    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                setLoading(true);
                const data = await apiService.getInstructors();
                setInstructors(data);
                setFilteredInstructors(data);
            } catch (err) {
                console.error("Error fetching instructors:", err);
                setError("Failed to load directory.");
            } finally {
                setLoading(false);
            }
        };
        fetchInstructors();
    }, []);

    // --- 2. Filter Logic ---
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

    // --- 3. Camera Logic (Manual Mode) ---
    const startCamera = async () => {
        try {
            setError(null);
            setScanMessage("");
            setScanStatus("idle");
            setRecognizedInstructor(null);

            // Start video stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.error("Play error:", e));
            }

            setIsCameraActive(true);

        } catch (err) {
            console.error("Camera Error:", err);
            setError("Camera access denied. Please allow camera permissions.");
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
        setScanStatus("idle");
        setScanMessage("");
    };

    // --- 4. Manual Capture & Verify ---
    const handleManualScan = async () => {
        if (!videoRef.current) return;

        setScanStatus("processing");
        setScanMessage("Analyzing...");
        setError(null);

        try {
            // 1. Capture Frame
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
            const base64Image = canvas.toDataURL('image/jpeg', 0.8);

            // 2. Send to Luxand (Uses 1 Request)
            const result = await apiService.recognizeLuxandFace(base64Image);

            // 3. Handle Success
            if (result.instructor) {
                console.log("✅ Match Found:", result.instructor.ins_fname);
                setScanStatus("success");
                setRecognizedInstructor(result.instructor);

                // Navigate after 1.5s
                setTimeout(() => {
                    stopCamera();
                    navigate(`/instructor-profile/${result.instructor.ins_id}`, {
                        state: {
                            verified: true,
                            instructor: result.instructor
                        }
                    });
                }, 1500);
            }

        } catch (err) {
            // Handle Failures
            setScanStatus("error");
            if (err.message?.includes('404')) {
                setScanMessage("Face not recognized. Try getting closer or better lighting.");
            } else if (err.message?.includes('limit')) {
                setScanMessage("API Limit Reached. Please check quota.");
                setError("API Limit Reached.");
            } else {
                setScanMessage("Recognition failed. Please try again.");
                console.error("Scan Error:", err);
            }

            // Reset status to idle after 2s so they can try again
            setTimeout(() => {
                if (scanStatus !== "success") setScanStatus("idle");
            }, 3000);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => stopCamera();
    }, []);

    // Handle clicking a name in the list (now just opens camera for manual scan)
    const handleListClick = (instructor) => {
        setSearchTerm(instructor.ins_lname);
        if (!isCameraActive) {
            startCamera();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <VerifyNavBar />

            <div className="w-full max-w-6xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT: Face Scanner */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-blue-900 p-4 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FaCamera /> Face Verification
                            </h2>
                            {isCameraActive && (
                                <span className="text-green-400 text-sm font-bold flex items-center gap-1">
                                    <span className="animate-pulse">●</span> Camera Ready
                                </span>
                            )}
                        </div>

                        <div className="p-6 flex flex-col items-center">
                            {/* Video Container */}
                            <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6 border-4 border-gray-200 shadow-inner">
                                {isCameraActive ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover transform -scale-x-100"
                                        />

                                        {/* Processing Overlay */}
                                        {scanStatus === "processing" && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
                                            </div>
                                        )}

                                        {/* Success Overlay */}
                                        {scanStatus === "success" && (
                                            <div className="absolute inset-0 bg-green-600 bg-opacity-95 flex flex-col items-center justify-center text-white z-50 transition-all duration-300">
                                                <FaCheckCircle size={70} className="mb-4 animate-bounce" />
                                                <h3 className="text-3xl font-bold mb-1">Verified!</h3>
                                                <p className="text-lg opacity-90">
                                                    Welcome, {recognizedInstructor?.ins_fname}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                                        <FaUserCircle size={64} className="mb-2 opacity-50" />
                                        <p>Camera is currently off</p>
                                    </div>
                                )}
                            </div>

                            {/* Status Messages */}
                            {scanMessage && scanStatus !== "success" && (
                                <div className={`w-full mb-4 p-3 rounded-lg text-center font-semibold ${
                                    scanStatus === "error" ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-700"
                                }`}>
                                    {scanMessage}
                                </div>
                            )}

                            {error && (
                                <div className="w-full mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                                    <FaExclamationTriangle /> {error}
                                </div>
                            )}

                            {/* --- CONTROLS --- */}
                            <div className="w-full">
                                {!isCameraActive ? (
                                    <button
                                        onClick={startCamera}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-md"
                                    >
                                        <FaCamera /> Open Verification Camera
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleManualScan}
                                            disabled={scanStatus === "processing" || scanStatus === "success"}
                                            className={`flex-1 py-3 rounded-lg font-bold transition shadow-md flex items-center justify-center gap-2 text-white
                                                ${scanStatus === "processing"
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-green-600 hover:bg-green-700"
                                            }`}
                                        >
                                            {scanStatus === "processing" ? (
                                                "Scanning..."
                                            ) : (
                                                <>
                                                    <FaRegDotCircle /> Scan Face
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={stopCamera}
                                            disabled={scanStatus === "success"}
                                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition shadow-md"
                                        >
                                            Close
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Secure Directory (Unchanged from before) */}
                <div className="flex flex-col h-[600px]">
                    <div className="bg-white rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
                        <div className="bg-gray-800 p-4 text-white">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FaIdCard /> Secure Directory
                            </h2>
                        </div>

                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <FaSync className="animate-spin mb-2" />
                                    <p>Loading...</p>
                                </div>
                            ) : filteredInstructors.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredInstructors.map((inst) => (
                                        <div
                                            key={inst.ins_id}
                                            onClick={() => handleListClick(inst)}
                                            className="flex items-center p-3 hover:bg-blue-50 border border-gray-100 rounded-lg cursor-pointer transition group"
                                        >
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm mr-4">
                                                {inst.ins_profile_pic ? (
                                                    <img src={inst.ins_profile_pic} alt="profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FaUserCircle className="text-gray-400 text-3xl" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800 group-hover:text-blue-700">
                                                    {inst.ins_fname} {inst.ins_lname}
                                                </h3>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded">{inst.ins_dept}</span>
                                                    <span>ID: {inst.ins_id}</span>
                                                </div>
                                            </div>
                                            <div className="text-gray-400 group-hover:text-orange-500 flex items-center gap-1 text-xs font-semibold">
                                                <FaLock /> Verify
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <FaUsers size={32} className="mb-2 opacity-20" />
                                    <p>No instructors found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}