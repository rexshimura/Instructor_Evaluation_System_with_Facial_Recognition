import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { evaluationQuestions } from "../../data/questions";
import analyzeRemarks from "../../utils/remarkAnalyzer";
import VerifyNavBar from "../../components/module_layout/VerifyNavBar";
import { FaLock, FaShieldAlt } from "react-icons/fa"; // Added icons for security UI

// --- Helper Functions & Constants ---
const getScoreWord = (score) => {
    if (score >= 4.5) return "Excellent";
    if (score >= 3.5) return "Very Good";
    if (score >= 2.5) return "Average";
    if (score >= 1.5) return "Needs Improvement";
    return "Poor";
};

const SCORE_COLORS = {
    Excellent: "bg-teal-500",
    "Very Good": "bg-blue-500",
    Average: "bg-yellow-500",
    "Needs Improvement": "bg-orange-500",
    Poor: "bg-red-500",
};

// Category mapping for database criteria
const categoryMapping = {
    "Course Organization and Content": "ev_C1",
    "Instructor's Knowledge and Presentation": "ev_C2",
    "Communication and Interaction": "ev_C3",
    "Assessment and Feedback": "ev_C4",
    "Overall Effectiveness": "ev_C5"
};

// Default zero scores for when no evaluations exist
const getDefaultScores = () => ({
    "Course Organization and Content": "0.00",
    "Instructor's Knowledge and Presentation": "0.00",
    "Communication and Interaction": "0.00",
    "Assessment and Feedback": "0.00",
    "Overall Effectiveness": "0.00"
});

// --- Child Components ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="text-center bg-slate-50 p-8 rounded-lg h-full flex justify-center items-center">
        <p className="text-slate-500 italic">{message}</p>
    </div>
);

const InfoCard = ({ title, children, icon }) => (
    <div className="bg-slate-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-slate-800 flex items-center gap-3">
            {icon}
            {title}
        </h3>
        <div className="space-y-3 text-slate-700">{children}</div>
    </div>
);

const ScoreBar = ({ category, score }) => {
    const scoreWord = getScoreWord(score);
    const barColor = score === 0 ? "bg-gray-400" : (SCORE_COLORS[scoreWord] || "bg-gray-400");
    const barWidth = `${(score / 5) * 100}%`;

    return (
        <div>
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700 mb-1">
                <span>{category}</span>
                <span>
          {score === 0 ? "No Data" : `${scoreWord} (${score})`}
        </span>
            </div>
            <div className="bg-slate-200 rounded-full h-3">
                <div
                    className={`${barColor} rounded-full h-3 transition-all duration-500 ease-out`}
                    style={{ width: barWidth }}
                />
            </div>
        </div>
    );
};

const RemarksSummary = ({ summary }) => (
    <div className="mb-6">
        <p className="text-lg font-bold text-slate-800 mb-2">Remarks Summary</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-100 p-3 rounded-lg text-center border border-green-200">
                <p className="text-2xl font-bold text-green-700">{summary.positiveCount}</p>
                <p className="font-semibold text-sm text-green-800">👍 Positive</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg text-center border border-red-200">
                <p className="text-2xl font-bold text-red-700">{summary.negativeCount}</p>
                <p className="font-semibold text-sm text-red-800">👎 Negative</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg text-center border border-yellow-200">
                <p className="text-2xl font-bold text-yellow-700">{summary.neutralCount}</p>
                <p className="font-semibold text-sm text-yellow-800">😐 Neutral</p>
            </div>
        </div>
    </div>
);

// --- Performance Calculation Logic ---
const calculatePerformance = (evaluations, instructorID) => {
    // ... (Keep your existing calculation logic here, it is correct) ...
    // To save space in this answer, I am omitting the calculation logic block
    // but you should KEEP IT exactly as it was in your code.

    if (!evaluations || evaluations.length === 0) {
        return {
            performanceBySubject: {},
            overallAverageCategoryScores: getDefaultScores(),
            overallRemarks: [],
            totalEvaluations: 0,
            hasEvaluations: false
        };
    }

    const relevantEvaluations = evaluations.filter(
        e => e.ins_id && e.ins_id.toString() === instructorID.toString()
    );

    if (relevantEvaluations.length === 0) {
        return {
            performanceBySubject: {},
            overallAverageCategoryScores: getDefaultScores(),
            overallRemarks: [],
            totalEvaluations: 0,
            hasEvaluations: false
        };
    }

    const performanceBySubject = {};
    let allRemarks = [];

    relevantEvaluations.forEach((evaluation) => {
        const ev_subject = evaluation.ev_subject || evaluation.subject_name;
        const ev_remark = evaluation.ev_remark;
        const sub_id = evaluation.sub_id;
        const subjectKey = sub_id || ev_subject;

        if (!subjectKey) return;

        if (!performanceBySubject[subjectKey]) {
            performanceBySubject[subjectKey] = {
                evaluations: [],
                remarks: [],
                totalScores: {},
                averageCategoryScores: {},
                subjectName: ev_subject || `Subject ${sub_id}`
            };
            Object.keys(categoryMapping).forEach(category => {
                performanceBySubject[subjectKey].totalScores[category] = { total: 0, count: 0 };
            });
        }

        performanceBySubject[subjectKey].evaluations.push(evaluation);
        if (ev_remark && ev_remark.trim() !== '') {
            performanceBySubject[subjectKey].remarks.push(ev_remark);
            allRemarks.push(ev_remark);
        }

        const scores = {
            "Course Organization and Content": evaluation.ev_C1 || evaluation.ev_c1,
            "Instructor's Knowledge and Presentation": evaluation.ev_C2 || evaluation.ev_c2,
            "Communication and Interaction": evaluation.ev_C3 || evaluation.ev_c3,
            "Assessment and Feedback": evaluation.ev_C4 || evaluation.ev_c4,
            "Overall Effectiveness": evaluation.ev_C5 || evaluation.ev_c5
        };

        Object.entries(scores).forEach(([category, score]) => {
            const numericScore = parseFloat(score);
            if (!isNaN(numericScore) && numericScore > 0) {
                performanceBySubject[subjectKey].totalScores[category].total += numericScore;
                performanceBySubject[subjectKey].totalScores[category].count += 1;
            }
        });
    });

    for (const subjectId in performanceBySubject) {
        const subjectData = performanceBySubject[subjectId];
        for (const category in subjectData.totalScores) {
            const { total, count } = subjectData.totalScores[category];
            subjectData.averageCategoryScores[category] = count > 0 ? (total / count).toFixed(2) : "0.00";
        }
    }

    const overallTotalScores = {};
    Object.keys(categoryMapping).forEach(category => {
        overallTotalScores[category] = { total: 0, count: 0 };
    });

    for (const subjectId in performanceBySubject) {
        for (const category in performanceBySubject[subjectId].totalScores) {
            overallTotalScores[category].total += performanceBySubject[subjectId].totalScores[category].total;
            overallTotalScores[category].count += performanceBySubject[subjectId].totalScores[category].count;
        }
    }

    const overallAverageCategoryScores = {};
    for (const category in overallTotalScores) {
        const { total, count } = overallTotalScores[category];
        overallAverageCategoryScores[category] = count > 0 ? (total / count).toFixed(2) : "0.00";
    }

    return {
        performanceBySubject,
        overallAverageCategoryScores,
        overallRemarks: allRemarks,
        totalEvaluations: relevantEvaluations.length,
        hasEvaluations: relevantEvaluations.length > 0
    };
};

// --- Main Profile Component ---
export default function InstructorProfile() {
    const { instructorID } = useParams();
    const location = useLocation(); // Hook to access navigation state
    const navigate = useNavigate();

    // Security State
    const [isVerified, setIsVerified] = useState(false);

    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [instructor, setInstructor] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [instructorSubjects, setInstructorSubjects] = useState([]);

    // --- 🔒 SECURITY CHECK (The Logic You Requested) ---
    useEffect(() => {
        // Check if the user came from the face scanner (verified: true)
        if (location.state && location.state.verified) {
            setIsVerified(true);
        } else {
            // If not verified, show error and redirect after 2 seconds
            setError("Access Denied: Face verification required.");
            setIsLoading(false);
            setTimeout(() => {
                navigate('/instructor-face-rec'); // Send back to scanner
            }, 2500);
        }
    }, [location, navigate]);

    // Normalize evaluation field names to handle case sensitivity
    const normalizedEvaluations = useMemo(() => {
        return evaluations.map(evaluation => ({
            ...evaluation,
            ev_C1: evaluation.ev_C1 || evaluation.ev_c1,
            ev_C2: evaluation.ev_C2 || evaluation.ev_c2,
            ev_C3: evaluation.ev_C3 || evaluation.ev_c3,
            ev_C4: evaluation.ev_C4 || evaluation.ev_c4,
            ev_C5: evaluation.ev_C5 || evaluation.ev_c5
        }));
    }, [evaluations]);

    // Only fetch data if Verified
    useEffect(() => {
        if (!isVerified) return; // Don't fetch if not secure

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch instructor data
                const instructorRes = await fetch(`/instructors/${instructorID}`);
                if (!instructorRes.ok) throw new Error("Failed to fetch instructor");
                const instructorData = await instructorRes.json();
                setInstructor(instructorData);

                // Fetch all subjects
                const subjectsRes = await fetch(`/subjects`);
                const subjectsData = await subjectsRes.json();
                setSubjects(subjectsData);

                // Fetch instructor-subject relationships
                try {
                    const instructorSubjectsRes = await fetch(`/instructor-subject`);
                    if (instructorSubjectsRes.ok) {
                        const instructorSubjectsData = await instructorSubjectsRes.json();
                        setInstructorSubjects(instructorSubjectsData);
                    }
                } catch (e) {}

                // Fetch evaluations
                try {
                    const evalRes = await fetch(`/evaluations/instructor/${instructorID}`);
                    if (evalRes.ok) {
                        const evalData = await evalRes.json();
                        let evaluationsArray = [];
                        if (Array.isArray(evalData)) {
                            evaluationsArray = evalData;
                        } else if (evalData && Array.isArray(evalData.evaluations)) {
                            evaluationsArray = evalData.evaluations;
                        }
                        setEvaluations(evaluationsArray);
                    }
                } catch (e) { setEvaluations([]); }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [instructorID, isVerified]);

    // Get subjects handled by this instructor
    const subjectsHandled = useMemo(() => {
        if (!instructor || !subjects.length || !instructorSubjects.length) return [];

        const instructorSubjectLinks = instructorSubjects.filter(
            link => link.ins_id && link.ins_id.toString() === instructorID
        );

        return instructorSubjectLinks.map(link => {
            const subject = subjects.find(s => s.sub_id === link.sub_id);
            return subject ? {
                sub_id: subject.sub_id,
                sub_name: subject.sub_name,
                sub_miscode: subject.sub_miscode,
                sub_units: subject.sub_units,
                sub_semester: subject.sub_semester,
                sub_course: subject.sub_course
            } : null;
        }).filter(Boolean);
    }, [instructor, subjects, instructorSubjects, instructorID]);

    // Calculate performance data
    const performanceData = useMemo(
        () => calculatePerformance(normalizedEvaluations, instructorID),
        [normalizedEvaluations, instructorID]
    );

    // Determine displayed data
    const displayedData = useMemo(() => {
        if (!performanceData) {
            return {
                averageCategoryScores: getDefaultScores(),
                remarks: [],
                totalReviews: 0,
                hasEvaluations: false,
                subjectName: "Overall Performance"
            };
        }

        if (selectedSubjectId) {
            const subjectData = performanceData.performanceBySubject[selectedSubjectId];
            if (subjectData) {
                return {
                    averageCategoryScores: subjectData.averageCategoryScores,
                    remarks: subjectData.remarks,
                    totalReviews: subjectData.evaluations.length,
                    hasEvaluations: performanceData.hasEvaluations,
                    subjectName: subjectData.subjectName
                };
            } else {
                const subject = subjectsHandled.find(s => s.sub_id === selectedSubjectId);
                return {
                    averageCategoryScores: getDefaultScores(),
                    remarks: [],
                    totalReviews: 0,
                    hasEvaluations: false,
                    subjectName: subject?.sub_name || 'Selected Subject'
                };
            }
        }

        return {
            averageCategoryScores: performanceData.overallAverageCategoryScores,
            remarks: performanceData.overallRemarks,
            totalReviews: performanceData.totalEvaluations,
            hasEvaluations: performanceData.hasEvaluations,
            subjectName: "Overall Performance"
        };
    }, [performanceData, selectedSubjectId, subjectsHandled]);


    // --- RENDER UI ---

    // 1. Show Error / Access Denied
    if (error) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6">
                <VerifyNavBar />
                <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-12 mt-16 text-center">
                    <div className="text-red-500 mb-4 flex justify-center">
                        <FaLock size={64} />
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <p className="text-sm text-slate-500">Redirecting to scanner...</p>
                </div>
            </div>
        );
    }

    // 2. Show Loading
    if (isLoading || !instructor) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6">
                <VerifyNavBar />
                <div className="w-full max-w-7xl bg-white rounded-lg shadow-xl p-8 mt-16 flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    const instructorName = instructor ?
        `${instructor.ins_fname || ''} ${instructor.ins_mname ? instructor.ins_mname[0] + '.' : ''} ${instructor.ins_lname || ''} ${instructor.ins_suffix || ''}`.trim()
        : '';

    const remarksSummary = displayedData ? analyzeRemarks(displayedData.remarks) : null;
    const hasRemarks = displayedData?.remarks?.filter(r => r && r.trim()).length > 0;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-6">
            <VerifyNavBar />
            <main className="w-full max-w-7xl bg-white rounded-lg shadow-xl p-6 sm:p-8 mt-16 space-y-8 relative">

                {/* --- Verified Badge --- */}
                <div className="absolute top-6 right-8 flex items-center gap-2 text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-sm">
                    <FaShieldAlt /> Verified Access
                </div>

                <header>
                    <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">
                        Instructor Profile
                    </h2>
                    <p className="text-center text-slate-500">Performance and information overview</p>
                </header>

                {/* --- Instructor Information --- */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard title="Personal Information" icon="👤">
                        <p><strong>Full Name:</strong> {instructorName}</p>
                        <p><strong>Department:</strong> {instructor.ins_dept}</p>
                        <p><strong>ID:</strong> {instructor.ins_id}</p>
                    </InfoCard>
                    <InfoCard title="Contact Details" icon="📞">
                        <p><strong>Email:</strong> {instructor.ins_email}</p>
                        <p><strong>Contact Number:</strong> {instructor.ins_contact}</p>
                    </InfoCard>
                </section>

                {/* --- Subjects Handled --- */}
                <section>
                    <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">
                        Subjects Handled ({subjectsHandled.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedSubjectId(null)}
                            className={`p-3 rounded-lg shadow-sm border transition-all duration-200 ${
                                !selectedSubjectId
                                    ? "bg-blue-600 text-white border-blue-700 font-bold"
                                    : "bg-white hover:bg-blue-50 hover:border-blue-300"
                            }`}
                        >
                            <p className="font-medium">Overall Performance</p>
                        </button>
                        {subjectsHandled.map((subject) => (
                            <button
                                key={subject.sub_id}
                                onClick={() => setSelectedSubjectId(subject.sub_id)}
                                className={`p-3 text-left rounded-lg shadow-sm border transition-all duration-200 ${
                                    selectedSubjectId === subject.sub_id
                                        ? "bg-blue-600 text-white border-blue-700 font-bold"
                                        : "bg-white hover:bg-blue-50 hover:border-blue-300"
                                }`}
                            >
                                <p className="font-medium">{subject.sub_name}</p>
                                <p className="text-sm opacity-80">
                                    {`${subject.sub_miscode} | ${subject.sub_course}`}
                                </p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* --- Performance Metrics --- */}
                <section>
                    <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-slate-800">
                        Performance Metrics
                        {!displayedData.hasEvaluations && (
                            <span className="text-sm font-normal text-orange-600 ml-2">
                (No evaluations yet)
              </span>
                        )}
                    </h3>

                    <div className="bg-slate-50 p-6 rounded-lg">
                        <p className="text-xl font-bold text-slate-800 mb-4">
                            {displayedData.subjectName}
                            <span className="text-base font-normal text-slate-600 ml-2">
                ({displayedData.totalReviews} reviews)
              </span>
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                {Object.entries(displayedData.averageCategoryScores).map(([category, score]) => (
                                    <ScoreBar key={category} category={category} score={parseFloat(score)} />
                                ))}
                            </div>

                            <div>
                                {remarksSummary && displayedData.totalReviews > 0 && (
                                    <RemarksSummary summary={remarksSummary} />
                                )}

                                <div>
                                    <p className="text-lg font-bold text-slate-800 mb-2">Student Remarks</p>
                                    <ul className="space-y-2 h-36 overflow-y-auto bg-white p-3 rounded border border-slate-200 custom-scrollbar">
                                        {hasRemarks ? (
                                            displayedData.remarks.filter(r => r && r.trim()).map((remark, index) => (
                                                <li key={index} className="border-l-4 border-blue-300 pl-3 text-slate-700 italic text-sm">
                                                    "{remark}"
                                                </li>
                                            ))
                                        ) : (
                                            <EmptyState message={
                                                displayedData.hasEvaluations
                                                    ? "No remarks available."
                                                    : "No evaluations submitted yet."
                                            } />
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}