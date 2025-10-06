import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom"; // Added for navigation
import AdminNavBar from "../../../components/module_layout/AdminNavBar";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Radar } from 'react-chartjs-2';
import { FiFilter, FiTrendingUp, FiTrendingDown, FiSmile, FiFrown, FiMeh, FiUsers, FiExternalLink, FiBookOpen, FiX, FiAward, FiHelpCircle, FiBriefcase, FiUserCheck } from "react-icons/fi";

// --- Data Imports ---
import admins from "../../../data/admin";
import moderators from "../../../data/moderators";
import studentData from '../../../data/list-students';
import evaluations from '../../../data/list-evaluations';
import instructorData from "../../../data/list-instructors";
import subjectLoad from "../../../data/list-subjects";
import analyzeRemarks from "../../../utils/remarkAnalyzer";

// --- Chart.js & Plugin Registration ---
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler, ChartDataLabels);

// ===================================================================
// --- UTILITY FUNCTIONS ---
// ===================================================================

const processEvaluationData = (evaluationList) => {
    const processed = []; let current = {};
    evaluationList.forEach(item => {
        if (item.ev_evalID) {
            if (Object.keys(current).length > 0) processed.push(current);
            current = { ...item };
        } else if (item.ev_scores) {
            current.ev_scores = { ...item.ev_scores };
        } else if (item.hasOwnProperty('ev_remarks')) {
            current.ev_remarks = item.ev_remarks;
        }
    });
    if (Object.keys(current).length > 0) processed.push(current);
    return processed;
};

const getScoreStyle = (score) => {
    if (score >= 4.5) return { text: "Excellent", color: "text-green-700", bg: "bg-green-100" };
    if (score >= 3.5) return { text: "Good", color: "text-sky-700", bg: "bg-sky-100" };
    if (score >= 2.5) return { text: "Average", color: "text-yellow-700", bg: "bg-yellow-100" };
    if (score >= 1.5) return { text: "Needs Improvement", color: "text-orange-700", bg: "bg-orange-100" };
    return { text: "Poor", color: "text-red-700", bg: "bg-red-100" };
};

const EVALUATION_CATEGORIES = [
    { name: 'Commitment', questions: ['q1', 'q2', 'q3'] }, { name: 'Knowledge', questions: ['q4', 'q5', 'q6'] },
    { name: 'Teaching', questions: ['q7', 'q8', 'q9'] }, { name: 'Management', questions: ['q10', 'q11', 'q12'] },
    { name: 'Personal Qualities', questions: ['q13', 'q14', 'q15'] }
];

// ===================================================================
// --- MAIN COMPONENT: AdminStatistics Dashboard ---
// ===================================================================

export default function AdminStatistics() {
  const [filters, setFilters] = useState({ course: 'All', year: 'All', semester: 'All', subject: 'All' });
  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, ...(name === 'course' && { subject: 'All' }) }));
  };

  const structuredEvaluations = useMemo(() => processEvaluationData(evaluations), []);

  const statistics = useMemo(() => {
    const filteredStudents = studentData.filter(s => (filters.course === 'All' || s.st_course === filters.course) && (filters.year === 'All' || s.st_year.toString() === filters.year) && (filters.semester === 'All' || s.st_semester.toString() === filters.semester));
    const filteredStudentIds = new Set(filteredStudents.map(s => s.st_studID));
    const filteredEvaluations = structuredEvaluations.filter(e => filteredStudentIds.has(e.st_studID) && (filters.subject === 'All' || e.sb_subID === filters.subject));

    const subjectOptions = [...new Set(subjectLoad.filter(s => filters.course === 'All' || s.sb_course === filters.course).map(s => JSON.stringify({ id: s.sb_subID, name: s.sb_name })))].map(s => JSON.parse(s));

    const sentimentSummary = analyzeRemarks(filteredEvaluations.map(e => e.ev_remarks).filter(Boolean));
    const totalRemarks = sentimentSummary.positiveCount + sentimentSummary.negativeCount + sentimentSummary.neutralCount;
    sentimentSummary.positivePercentage = totalRemarks > 0 ? (sentimentSummary.positiveCount / totalRemarks) * 100 : 0;
    sentimentSummary.negativePercentage = totalRemarks > 0 ? (sentimentSummary.negativeCount / totalRemarks) * 100 : 0;
    sentimentSummary.neutralPercentage = totalRemarks > 0 ? (sentimentSummary.neutralCount / totalRemarks) * 100 : 0;

    const instructorMetrics = {};
    const subjectMetrics = {};

    filteredEvaluations.forEach(ev => {
        const { in_instID, sb_subID, ev_scores } = ev;
        if (!ev_scores) return;

        let currentScore = 0;
        let questionCount = 0;
        EVALUATION_CATEGORIES.forEach(cat => { cat.questions.forEach(qId => { if (ev_scores[qId] !== undefined) { currentScore += ev_scores[qId]; questionCount++; } }); });

        if (in_instID) {
            if (!instructorMetrics[in_instID]) {
                const info = instructorData.find(i => i.in_instructorID === in_instID);
                instructorMetrics[in_instID] = { name: `${info?.in_fname} ${info?.in_lname}`, dept: info?.in_dept, totalScore: 0, reviewCount: 0 };
            }
            instructorMetrics[in_instID].totalScore += currentScore;
            instructorMetrics[in_instID].reviewCount += questionCount;
        }

        if (sb_subID) {
            if (!subjectMetrics[sb_subID]) {
                const subjectInfo = subjectLoad.find(s => s.sb_subID === sb_subID);
                subjectMetrics[sb_subID] = { name: subjectInfo?.sb_name || 'Unknown', course: subjectInfo?.sb_course || 'N/A', totalScore: 0, reviewCount: 0, instructorIds: new Set() };
            }
            subjectMetrics[sb_subID].totalScore += currentScore;
            subjectMetrics[sb_subID].reviewCount += questionCount;
            if (in_instID) subjectMetrics[sb_subID].instructorIds.add(in_instID);
        }
    });

    const instructorBreakdown = Object.entries(instructorMetrics).map(([id, data]) => ({ id, name: data.name, dept: data.dept, average: data.reviewCount > 0 ? (data.totalScore / data.reviewCount) : 0 }));
    const subjectBreakdown = Object.entries(subjectMetrics).map(([id, data]) => ({ id, name: data.name, course: data.course, average: data.reviewCount > 0 ? (data.totalScore / data.reviewCount) : 0, reviews: data.reviewCount / 15, instructorIds: Array.from(data.instructorIds) }));

    const leaderboard = instructorBreakdown.map(inst => {
        const reviews = (instructorMetrics[inst.id]?.reviewCount || 0) / 15;
        return { ...inst, reviews, impactScore: inst.average * Math.log10(reviews + 1) };
    });

    const overallCategoryTotals = {};
    EVALUATION_CATEGORIES.forEach(cat => overallCategoryTotals[cat.name] = { total: 0, count: 0 });
    filteredEvaluations.forEach(ev => { if (!ev.ev_scores) return; EVALUATION_CATEGORIES.forEach(cat => cat.questions.forEach(qId => { if (ev.ev_scores[qId] !== undefined) { overallCategoryTotals[cat.name].total += ev.ev_scores[qId]; overallCategoryTotals[cat.name].count++; } })); });
    const averageCategoryScores = {};
    EVALUATION_CATEGORIES.forEach(cat => { averageCategoryScores[cat.name] = overallCategoryTotals[cat.name].count > 0 ? (overallCategoryTotals[cat.name].total / overallCategoryTotals[cat.name].count) : 0; });

    return {
        subjectOptions, sentimentSummary, averageCategoryScores,
        bestPerformingSubjects: subjectBreakdown.sort((a, b) => b.average - a.average),
        leastPerformingSubjects: [...subjectBreakdown].sort((a, b) => a.average - b.average),
        numberOfResponses: filteredEvaluations.length,
        topPerformers: leaderboard.sort((a, b) => b.impactScore - a.impactScore).slice(0, 3),
        needsAttention: leaderboard.filter(inst => inst.average < 3).sort((a, b) => a.average - b.average),
    };
  }, [filters, structuredEvaluations]);

  const handleSubjectClick = (subject) => {
    const instructors = subject.instructorIds.map(id => instructorData.find(inst => inst.in_instructorID === id)).filter(Boolean);
    setSelectedSubject({ ...subject, instructors });
  };
  const handleCloseModal = () => setSelectedSubject(null);

  const performanceChartTitle = useMemo(() => {
    const { course, year, semester, subject } = filters;
    const subjectInfo = statistics.subjectOptions.find(s => s.id === subject);
    const subjectName = subject !== 'All' && subjectInfo ? subjectInfo.name : null;
    const parts = [ course === 'All' ? 'All Courses' : course, year === 'All' ? null : `${year}${year === '1' ? 'st' : year === '2' ? 'nd' : year === '3' ? 'rd' : 'th'} Year`, semester === 'All' ? null : `${semester}${semester === '1' ? 'st' : 'nd'} Sem`, subjectName ].filter(Boolean);
    return parts.join(' • ');
  }, [filters, statistics.subjectOptions]);

  const performanceChartData = {
    labels: Object.keys(statistics.averageCategoryScores),
    datasets: [{
      label: 'Average Score', data: Object.values(statistics.averageCategoryScores).map(s => s.toFixed(2)),
      backgroundColor: 'rgba(79, 70, 229, 0.2)', borderColor: 'rgba(79, 70, 229, 1)', borderWidth: 2,
    }],
  };
  const chartOptions = { maintainAspectRatio: false, scales: { r: { beginAtZero: true, max: 5 } }, plugins: { legend: { display: false }, datalabels: { backgroundColor: 'rgba(79, 70, 229, 0.8)', color: 'white', borderRadius: 4, font: { weight: 'bold' }, padding: { top: 4, bottom: 2 } } } };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminNavBar />
      <main className="flex-1 p-4 md:p-8 max-w-screen-xl mx-auto w-full">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Performance & Engagement Dashboard</h1>
            <p className="mt-1 text-gray-500">Drill-down analytics for faculty evaluation data.</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SystemStatCard label="Total Admins" count={admins.length} icon={<FiBriefcase className="text-indigo-600 text-xl" />} />
            <SystemStatCard label="Total Moderators" count={moderators.length} to="/adm-moderator-list" icon={<FiUserCheck className="text-indigo-600 text-xl" />} />
            <SystemStatCard label="Total Instructors" count={instructorData.length} to="/adm-instructor-list" icon={<FiAward className="text-indigo-600 text-xl" />} />
            <SystemStatCard label="Total Students" count={studentData.length} icon={<FiUsers className="text-indigo-600 text-xl" />} />
        </div>

        <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200 mb-8">
           <div className="flex items-center mb-4"><FiFilter className="text-gray-500 mr-2" /><h3 className="text-lg font-semibold text-gray-700">Filters</h3></div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FilterDropdown label="Course" name="course" value={filters.course} onChange={handleFilterChange} options={[{ id: 'All', name: 'All Courses' }, { id: 'BSIT', name: 'BSIT' }, { id: 'BSIS', name: 'BSIS' }]} />
              <FilterDropdown label="Year Level" name="year" value={filters.year} onChange={handleFilterChange} options={[{ id: 'All', name: 'All Years' }, { id: '1', name: '1st Year' }, { id: '2', name: '2nd Year' }, { id: '3', name: '3rd Year' }, { id: '4', name: '4th Year' }]} />
              <FilterDropdown label="Semester" name="semester" value={filters.semester} onChange={handleFilterChange} options={[{ id: 'All', name: 'All Semesters' }, { id: '1', name: '1st Semester' }, { id: '2', name: '2nd Semester' }]} />
              <FilterDropdown label="Subject" name="subject" value={filters.subject} onChange={handleFilterChange} options={[{ id: 'All', name: 'All Subjects' }, ...statistics.subjectOptions]} disabled={filters.course === "All" && filters.year === "All"} />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-semibold text-gray-800">Performance by Category</h2>
                            <InfoTooltip text="This chart shows the average evaluation score across five key categories based on the current filters." />
                        </div>
                        <p className="text-sm text-gray-500 mb-4 truncate" title={performanceChartTitle}>{performanceChartTitle || "Overview"}</p>
                        <div className="w-full h-80">{statistics.numberOfResponses > 0 ? <Radar data={performanceChartData} options={chartOptions} /> : <EmptyState message="No data for current filters."/>}</div>
                    </div>
                    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Sentiment Analysis</h2>
                            <InfoTooltip text="Analyzes the sentiment (positive, negative, neutral) of written remarks from student evaluations." />
                        </div>
                        <div className="flex-grow flex flex-col justify-center gap-4">
                            <SentimentCard icon={<FiSmile className="text-green-500"/>} label="Positive Remarks" count={statistics.sentimentSummary.positiveCount} percentage={statistics.sentimentSummary.positivePercentage}/>
                            <SentimentCard icon={<FiFrown className="text-red-500"/>} label="Negative Remarks" count={statistics.sentimentSummary.negativeCount} percentage={statistics.sentimentSummary.negativePercentage}/>
                            <SentimentCard icon={<FiMeh className="text-yellow-500"/>} label="Neutral Remarks" count={statistics.sentimentSummary.neutralCount} percentage={statistics.sentimentSummary.neutralPercentage}/>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                    <InstructorLeaderboard title="Top Performers" instructors={statistics.topPerformers} icon={<FiTrendingUp className="text-green-500"/>} />
                    <InstructorLeaderboard title="Needs Attention" instructors={statistics.needsAttention} icon={<FiTrendingDown className="text-orange-500"/>} />
                </div>
            </div>
            <div className="lg:col-span-1 bg-white shadow-lg rounded-xl p-6 flex flex-col max-h-[860px]">
                <div className="flex-1 flex flex-col min-h-0">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Best Performing Subjects</h2>
                    <div className="overflow-y-auto flex-1 custom-scrollbar -mr-2 pr-2">
                        {statistics.bestPerformingSubjects.length > 0 ?
                            statistics.bestPerformingSubjects.map(subj => <SubjectDetailCard key={subj.id} subject={subj} onClick={() => handleSubjectClick(subj)} />) :
                            <EmptyState message="No subjects match filters."/>
                        }
                    </div>
                </div>
                <div className="my-4 border-t"></div>
                <div className="flex-1 flex flex-col min-h-0">
                     <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Least Performing Subjects</h2>
                     <div className="overflow-y-auto flex-1 custom-scrollbar -mr-2 pr-2">
                        {statistics.leastPerformingSubjects.length > 0 ?
                            statistics.leastPerformingSubjects.map(subj => <SubjectDetailCard key={subj.id} subject={subj} onClick={() => handleSubjectClick(subj)} />) :
                            <EmptyState message="No subjects match filters."/>
                        }
                    </div>
                </div>
            </div>
        </div>
      </main>
      {selectedSubject && <SubjectInstructorsModal subject={selectedSubject} onClose={handleCloseModal} />}
      <footer className="bg-white text-center py-4 border-t border-gray-200 mt-auto">
        <p className="text-sm text-gray-600">© {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)</p>
      </footer>
    </div>
  );
}

// --- Reusable Sub-components for the Dashboard ---
const InfoTooltip = ({ text }) => (
  <div className="relative group flex items-center">
    <FiHelpCircle className="text-gray-400 hover:text-gray-600 cursor-pointer" />
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 p-3 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
      {text}
    </div>
  </div>
);

const SystemStatCard = ({ label, count, to, icon }) => {
    const content = (
        <div className={`w-full bg-white p-4 rounded-lg shadow-md flex items-center border border-transparent ${to ? 'hover:shadow-lg hover:border-indigo-400 transition-all duration-300' : ''}`}>
            <div className="p-3 bg-indigo-100 rounded-lg mr-4">{icon}</div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{count}</p>
            </div>
        </div>
    );
    return to ? <Link to={to} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-lg">{content}</Link> : content;
};

const FilterDropdown = ({ label, name, value, onChange, options, disabled }) => (
    <div><label className="block text-sm font-medium text-gray-700">{label}</label><select name={name} value={value} onChange={onChange} disabled={disabled} className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm disabled:bg-gray-100">{options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}</select></div>
);

const SentimentCard = ({ icon, label, count, percentage }) => (
    <div className="flex items-center bg-gray-50 p-3 rounded-lg">
        <div className="text-3xl mr-4">{icon}</div>
        <div className="flex-1">
            <p className="text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{count}</p>
        </div>
        <div className="text-right">
            <p className="text-xl font-bold text-gray-400">{percentage.toFixed(1)}%</p>
        </div>
    </div>
);

const InstructorLeaderboard = ({ title, instructors, icon }) => (
    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="text-xl">{icon}</div>
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            </div>
            {title === "Top Performers" && <InfoTooltip text="Highlights the top 3 instructors based on a weighted score that considers both average rating and number of reviews." />}
            {title === "Needs Attention" && <InfoTooltip text="Lists all instructors with an average evaluation score of 3.0 or below." />}
        </div>
        <ul className="space-y-3 flex-1 pr-2 -mr-2 custom-scrollbar overflow-y-auto">
            {instructors.length > 0 ? instructors.map(inst => (
                <li key={inst.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-700 truncate">{inst.name}</p>
                        <p className="text-xs text-gray-500">{inst.dept} &bull; {inst.reviews.toFixed(0)} reviews</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <Link to={`/adm-instructor-list/${inst.id}`} title="View Profile" className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors">
                            <FiExternalLink className="w-5 h-5" />
                        </Link>
                        <p className={`text-lg font-bold w-12 text-right ${getScoreStyle(inst.average).color}`}>{inst.average.toFixed(2)}</p>
                    </div>
                </li>
            )) : (
                <div className="flex items-center justify-center h-full pt-8">
                    <EmptyState message={title === "Needs Attention" ? "No instructors need attention." : "Not enough data."} />
                </div>
            )}
        </ul>
    </div>
);

const SubjectDetailCard = ({ subject, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-3 rounded-lg mb-2 border border-gray-200 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate" title={subject.name}>{subject.name}</p>
                <p className="text-xs text-gray-500">{subject.course} &bull; {subject.reviews.toFixed(0)} reviews</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
                <div title={getScoreStyle(subject.average).text} className={`font-bold text-lg px-3 py-1 rounded-full ${getScoreStyle(subject.average).bg} ${getScoreStyle(subject.average).color}`}>
                    {subject.average.toFixed(2)}
                </div>
            </div>
        </div>
    </button>
);

const SubjectInstructorsModal = ({ subject, onClose }) => {
    if (!subject) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100">
                    <FiX size={20} />
                </button>
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3"><FiBookOpen className="text-indigo-600" /></div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 -mb-1">{subject.name}</h3>
                        <p className="text-sm text-gray-500">Instructors for this subject</p>
                    </div>
                </div>
                <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                    {subject.instructors.length > 0 ? subject.instructors.map(inst => (
                        <li key={inst.in_instructorID} className="flex items-center p-2.5 bg-gray-50 rounded-lg border">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{`${inst.in_fname} ${inst.in_lname}`}</p>
                                <p className="text-xs text-gray-500">{inst.in_dept}</p>
                            </div>
                            <Link to={`/adm-instructor-list/${inst.in_instructorID}`} title="View Profile" className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors">
                                <FiExternalLink className="w-5 h-5" />
                            </Link>
                        </li>
                    )) : (
                        <li className="text-gray-500 italic text-center py-4">No instructors found for this subject.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

const EmptyState = ({ message }) => (<div className="text-center py-10"><p className="text-gray-500 italic">{message}</p></div>);

