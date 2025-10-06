import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminNavBar from "../../../components/module_layout/AdminNavBar";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Radar } from 'react-chartjs-2';
import { FiFilter, FiTrendingUp, FiTrendingDown, FiSmile, FiFrown, FiMeh, FiUsers, FiExternalLink, FiBookOpen, FiX, FiAward, FiHelpCircle, FiBriefcase, FiUserCheck } from "react-icons/fi";
import analyzeRemarks from "../../../utils/remarkAnalyzer";

// --- Chart.js & Plugin Registration ---
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler, ChartDataLabels);

const API_BASE = "http://localhost:5000";

// ===================================================================
// --- UTILITY FUNCTIONS ---
// ===================================================================

const getScoreStyle = (score) => {
    if (score >= 4.5) return { text: "Excellent", color: "text-green-700", bg: "bg-green-100" };
    if (score >= 3.5) return { text: "Good", color: "text-sky-700", bg: "bg-sky-100" };
    if (score >= 2.5) return { text: "Average", color: "text-yellow-700", bg: "bg-yellow-100" };
    if (score >= 1.5) return { text: "Needs Improvement", color: "text-orange-700", bg: "bg-orange-100" };
    return { text: "Poor", color: "text-red-700", bg: "bg-red-100" };
};

const EVALUATION_CATEGORIES = [
    { name: 'Commitment', field: 'ev_c1' },
    { name: 'Knowledge', field: 'ev_c2' },
    { name: 'Teaching', field: 'ev_c3' },
    { name: 'Management', field: 'ev_c4' },
    { name: 'Personal Qualities', field: 'ev_c5' }
];

// ===================================================================
// --- MAIN COMPONENT: AdminStatistics Dashboard ---
// ===================================================================

export default function AdminStatistics() {
  const [filters, setFilters] = useState({ course: 'All', year: 'All', semester: 'All', subject: 'All' });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    admins: [],
    moderators: [],
    students: [],
    evaluations: [],
    instructors: [],
    subjects: []
  });

  // Fetch all data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          moderatorsRes,
          studentsRes,
          evaluationsRes,
          instructorsRes,
          subjectsRes
        ] = await Promise.all([
          axios.get(`${API_BASE}/moderators`),
          axios.get(`${API_BASE}/student_list`),
          axios.get(`${API_BASE}/evaluations`),
          axios.get(`${API_BASE}/instructor_list`),
          axios.get(`${API_BASE}/subject_list`)
        ]);

        console.log('Raw API Responses:', {
          students: studentsRes.data,
          evaluations: evaluationsRes.data
        });

        // FIX: Handle the field name mismatch between database and API response
        // Database has st_studID but API might be returning st_studid (lowercase)
        const processedStudents = studentsRes.data.map(student => ({
          ...student,
          // Ensure we have the correct field name for student ID
          st_studid: student.st_studid || student.st_studID || student.st_studId
        }));

        console.log('Processed students with IDs:', processedStudents.map(s => s.st_studid));

        setData({
          admins: [], // Static for now
          moderators: moderatorsRes.data,
          students: processedStudents,
          evaluations: evaluationsRes.data,
          instructors: instructorsRes.data,
          subjects: subjectsRes.data
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, ...(name === 'course' && { subject: 'All' }) }));
  };

  const statistics = useMemo(() => {
    if (loading) {
      return {
        subjectOptions: [],
        sentimentSummary: { positiveCount: 0, negativeCount: 0, neutralCount: 0, positivePercentage: 0, negativePercentage: 0, neutralPercentage: 0 },
        averageCategoryScores: {},
        bestPerformingSubjects: [],
        leastPerformingSubjects: [],
        numberOfResponses: 0,
        topPerformers: [],
        needsAttention: []
      };
    }

    console.log('Processing statistics with data:', {
      totalEvaluations: data.evaluations.length,
      totalStudents: data.students.length,
      totalInstructors: data.instructors.length,
      totalSubjects: data.subjects.length,
      filters
    });

    // Handle case where there might be no data
    if (!data.evaluations || data.evaluations.length === 0) {
      console.log('No evaluations data found');
      return {
        subjectOptions: [],
        sentimentSummary: { positiveCount: 0, negativeCount: 0, neutralCount: 0, positivePercentage: 0, negativePercentage: 0, neutralPercentage: 0 },
        averageCategoryScores: {},
        bestPerformingSubjects: [],
        leastPerformingSubjects: [],
        numberOfResponses: 0,
        topPerformers: [],
        needsAttention: []
      };
    }

    // Debug: Check student IDs
    console.log('Available student IDs:', data.students.map(s => ({
      id: s.st_studid,
      name: `${s.st_fname} ${s.st_lname}`
    })));

    const filteredStudents = data.students.filter(s => {
      const courseMatch = filters.course === 'All' || s.st_course === filters.course;
      const yearMatch = filters.year === 'All' || s.st_year?.toString() === filters.year;
      const semesterMatch = filters.semester === 'All' || s.st_semester?.toString() === filters.semester;
      
      return courseMatch && yearMatch && semesterMatch;
    });

    console.log('Filtered students:', filteredStudents.length, filteredStudents);

    // FIX: Use the correct field name that exists in the data
    const filteredStudentIds = new Set(filteredStudents.map(s => {
      // Try different possible field names
      const studentId = s.st_studid || s.st_studID || s.st_studId;
      console.log('Student ID mapping:', { 
        original: s, 
        extractedId: studentId,
        availableFields: Object.keys(s)
      });
      return studentId ? studentId.toString() : null;
    }).filter(id => id !== null));

    console.log('Student IDs to match:', Array.from(filteredStudentIds));

    const filteredEvaluations = data.evaluations.filter(e => {
      // Convert evaluation student ID to string for comparison
      const evalStudentId = e.st_studid?.toString();
      const studentMatch = filteredStudentIds.has(evalStudentId);
      const subjectMatch = filters.subject === 'All' || e.ev_subject?.toString() === filters.subject;
      
      console.log(`Evaluation ${e.ev_id}: student ID ${evalStudentId}, match: ${studentMatch}, subject match: ${subjectMatch}`);
      
      return studentMatch && subjectMatch;
    });

    console.log('Filtered evaluations:', filteredEvaluations.length, filteredEvaluations);

    const subjectOptions = [...new Set(data.subjects
      .filter(s => filters.course === 'All' || s.sb_course === filters.course)
      .map(s => ({ id: s.sb_subid.toString(), name: s.sb_name }))
    )];

    const sentimentSummary = analyzeRemarks(filteredEvaluations.map(e => e.ev_remark).filter(Boolean));
    const totalRemarks = sentimentSummary.positiveCount + sentimentSummary.negativeCount + sentimentSummary.neutralCount;
    sentimentSummary.positivePercentage = totalRemarks > 0 ? (sentimentSummary.positiveCount / totalRemarks) * 100 : 0;
    sentimentSummary.negativePercentage = totalRemarks > 0 ? (sentimentSummary.negativeCount / totalRemarks) * 100 : 0;
    sentimentSummary.neutralPercentage = totalRemarks > 0 ? (sentimentSummary.neutralCount / totalRemarks) * 100 : 0;

    const instructorMetrics = {};
    const subjectMetrics = {};

    filteredEvaluations.forEach(ev => {
        const { in_instructorid, ev_subject, ev_c1, ev_c2, ev_c3, ev_c4, ev_c5 } = ev;
        
        // Check if we have valid scores
        const scores = [ev_c1, ev_c2, ev_c3, ev_c4, ev_c5].filter(score => 
          score !== null && score !== undefined && !isNaN(parseFloat(score))
        );
        
        if (scores.length === 0) return;

        const currentScore = scores.reduce((sum, score) => sum + parseFloat(score), 0) / scores.length;

        // Process instructor metrics
        if (in_instructorid) {
            if (!instructorMetrics[in_instructorid]) {
                const info = data.instructors.find(i => i.in_instructorid === in_instructorid);
                instructorMetrics[in_instructorid] = { 
                    name: info ? `${info.in_fname} ${info.in_lname}` : 'Unknown Instructor',
                    dept: info?.in_dept || 'N/A', 
                    totalScore: 0, 
                    reviewCount: 0 
                };
            }
            instructorMetrics[in_instructorid].totalScore += currentScore;
            instructorMetrics[in_instructorid].reviewCount += 1;
        }

        // Process subject metrics
        if (ev_subject) {
            const subjectId = ev_subject.toString();
            if (!subjectMetrics[subjectId]) {
                const subjectInfo = data.subjects.find(s => s.sb_subid === ev_subject);
                subjectMetrics[subjectId] = { 
                    name: subjectInfo?.sb_name || 'Unknown Subject', 
                    course: subjectInfo?.sb_course || 'N/A', 
                    totalScore: 0, 
                    reviewCount: 0, 
                    instructorIds: new Set() 
                };
            }
            subjectMetrics[subjectId].totalScore += currentScore;
            subjectMetrics[subjectId].reviewCount += 1;
            if (in_instructorid) subjectMetrics[subjectId].instructorIds.add(in_instructorid);
        }
    });

    console.log('Instructor metrics:', Object.keys(instructorMetrics).length);
    console.log('Subject metrics:', Object.keys(subjectMetrics).length);

    const instructorBreakdown = Object.entries(instructorMetrics).map(([id, data]) => ({
        id,
        name: data.name,
        dept: data.dept,
        average: data.reviewCount > 0 ? (data.totalScore / data.reviewCount) : 0,
        reviews: data.reviewCount
    }));

    const subjectBreakdown = Object.entries(subjectMetrics).map(([id, data]) => ({
        id,
        name: data.name,
        course: data.course,
        average: data.reviewCount > 0 ? (data.totalScore / data.reviewCount) : 0,
        reviews: data.reviewCount,
        instructorIds: Array.from(data.instructorIds)
    }));

    const leaderboard = instructorBreakdown.map(inst => ({
        ...inst,
        impactScore: inst.average * Math.log10(inst.reviews + 1)
    }));

    // Calculate average category scores
    const overallCategoryTotals = {};
    EVALUATION_CATEGORIES.forEach(cat => {
        overallCategoryTotals[cat.name] = { total: 0, count: 0 };
    });

    filteredEvaluations.forEach(ev => {
        EVALUATION_CATEGORIES.forEach(cat => {
            const score = ev[cat.field];
            if (score !== null && score !== undefined && !isNaN(parseFloat(score))) {
                overallCategoryTotals[cat.name].total += parseFloat(score);
                overallCategoryTotals[cat.name].count += 1;
            }
        });
    });

    const averageCategoryScores = {};
    EVALUATION_CATEGORIES.forEach(cat => {
        averageCategoryScores[cat.name] = overallCategoryTotals[cat.name].count > 0 
            ? (overallCategoryTotals[cat.name].total / overallCategoryTotals[cat.name].count) 
            : 0;
    });

    console.log('Final statistics:', {
        evaluationsCount: filteredEvaluations.length,
        instructorCount: instructorBreakdown.length,
        subjectCount: subjectBreakdown.length,
        categoryScores: averageCategoryScores
    });

    return {
        subjectOptions,
        sentimentSummary,
        averageCategoryScores,
        bestPerformingSubjects: subjectBreakdown.sort((a, b) => b.average - a.average),
        leastPerformingSubjects: [...subjectBreakdown].sort((a, b) => a.average - b.average),
        numberOfResponses: filteredEvaluations.length,
        topPerformers: leaderboard.sort((a, b) => b.impactScore - a.impactScore).slice(0, 3),
        needsAttention: leaderboard.filter(inst => inst.average < 3).sort((a, b) => a.average - b.average),
    };
  }, [filters, data, loading]);

  const handleSubjectClick = (subject) => {
    const instructors = subject.instructorIds.map(id => 
      data.instructors.find(inst => inst.in_instructorid === id)
    ).filter(Boolean);
    setSelectedSubject({ ...subject, instructors });
  };

  const handleCloseModal = () => setSelectedSubject(null);

  const performanceChartTitle = useMemo(() => {
    const { course, year, semester, subject } = filters;
    const subjectInfo = statistics.subjectOptions.find(s => s.id === subject);
    const subjectName = subject !== 'All' && subjectInfo ? subjectInfo.name : null;
    const parts = [ 
      course === 'All' ? 'All Courses' : course, 
      year === 'All' ? null : `${year}${year === '1' ? 'st' : year === '2' ? 'nd' : year === '3' ? 'rd' : 'th'} Year`, 
      semester === 'All' ? null : `${semester}${semester === '1' ? 'st' : 'nd'} Sem`, 
      subjectName 
    ].filter(Boolean);
    return parts.join(' • ');
  }, [filters, statistics.subjectOptions]);

  const performanceChartData = {
    labels: Object.keys(statistics.averageCategoryScores),
    datasets: [{
      label: 'Average Score', 
      data: Object.values(statistics.averageCategoryScores).map(s => parseFloat(s.toFixed(2))),
      backgroundColor: 'rgba(79, 70, 229, 0.2)', 
      borderColor: 'rgba(79, 70, 229, 1)', 
      borderWidth: 2,
    }],
  };

  const chartOptions = { 
    maintainAspectRatio: false, 
    scales: { 
      r: { 
        beginAtZero: true, 
        max: 5,
        ticks: {
          stepSize: 1
        }
      } 
    }, 
    plugins: { 
      legend: { display: false }, 
      datalabels: { 
        backgroundColor: 'rgba(79, 70, 229, 0.8)', 
        color: 'white', 
        borderRadius: 4, 
        font: { weight: 'bold' }, 
        padding: { top: 4, bottom: 2 } 
      } 
    } 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <AdminNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminNavBar />
      <main className="flex-1 p-4 md:p-8 max-w-screen-xl mx-auto w-full">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Performance & Engagement Dashboard</h1>
            <p className="mt-1 text-gray-500">Drill-down analytics for faculty evaluation data.</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SystemStatCard label="Total Admins" count={data.admins.length} icon={<FiBriefcase className="text-indigo-600 text-xl" />} />
            <SystemStatCard label="Total Moderators" count={data.moderators.length} to="/adm-moderator-list" icon={<FiUserCheck className="text-indigo-600 text-xl" />} />
            <SystemStatCard label="Total Instructors" count={data.instructors.length} to="/adm-instructor-list" icon={<FiAward className="text-indigo-600 text-xl" />} />
            <SystemStatCard label="Total Students" count={data.students.length} icon={<FiUsers className="text-indigo-600 text-xl" />} />
        </div>

        <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200 mb-8">
           <div className="flex items-center mb-4">
             <FiFilter className="text-gray-500 mr-2" />
             <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FilterDropdown 
                label="Course" 
                name="course" 
                value={filters.course} 
                onChange={handleFilterChange} 
                options={[
                  { id: 'All', name: 'All Courses' }, 
                  { id: 'BSIT', name: 'BSIT' }, 
                  { id: 'BSIS', name: 'BSIS' }
                ]} 
              />
              <FilterDropdown 
                label="Year Level" 
                name="year" 
                value={filters.year} 
                onChange={handleFilterChange} 
                options={[
                  { id: 'All', name: 'All Years' }, 
                  { id: '1', name: '1st Year' }, 
                  { id: '2', name: '2nd Year' }, 
                  { id: '3', name: '3rd Year' }, 
                  { id: '4', name: '4th Year' }
                ]} 
              />
              <FilterDropdown 
                label="Semester" 
                name="semester" 
                value={filters.semester} 
                onChange={handleFilterChange} 
                options={[
                  { id: 'All', name: 'All Semesters' }, 
                  { id: '1', name: '1st Semester' }, 
                  { id: '2', name: '2nd Semester' }
                ]} 
              />
              <FilterDropdown 
                label="Subject" 
                name="subject" 
                value={filters.subject} 
                onChange={handleFilterChange} 
                options={[
                  { id: 'All', name: 'All Subjects' }, 
                  ...statistics.subjectOptions
                ]} 
                disabled={filters.course === "All" && filters.year === "All"} 
              />
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
                        <p className="text-sm text-gray-500 mb-4 truncate" title={performanceChartTitle}>
                          {performanceChartTitle || "Overview"}
                        </p>
                        <div className="w-full h-80">
                          {statistics.numberOfResponses > 0 ? (
                            <Radar data={performanceChartData} options={chartOptions} />
                          ) : (
                            <EmptyState message="No data for current filters." />
                          )}
                        </div>
                    </div>
                    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Sentiment Analysis</h2>
                            <InfoTooltip text="Analyzes the sentiment (positive, negative, neutral) of written remarks from student evaluations." />
                        </div>
                        <div className="flex-grow flex flex-col justify-center gap-4">
                            <SentimentCard 
                              icon={<FiSmile className="text-green-500"/>} 
                              label="Positive Remarks" 
                              count={statistics.sentimentSummary.positiveCount} 
                              percentage={statistics.sentimentSummary.positivePercentage}
                            />
                            <SentimentCard 
                              icon={<FiFrown className="text-red-500"/>} 
                              label="Negative Remarks" 
                              count={statistics.sentimentSummary.negativeCount} 
                              percentage={statistics.sentimentSummary.negativePercentage}
                            />
                            <SentimentCard 
                              icon={<FiMeh className="text-yellow-500"/>} 
                              label="Neutral Remarks" 
                              count={statistics.sentimentSummary.neutralCount} 
                              percentage={statistics.sentimentSummary.neutralPercentage}
                            />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                    <InstructorLeaderboard 
                      title="Top Performers" 
                      instructors={statistics.topPerformers} 
                      icon={<FiTrendingUp className="text-green-500"/>} 
                    />
                    <InstructorLeaderboard 
                      title="Needs Attention" 
                      instructors={statistics.needsAttention} 
                      icon={<FiTrendingDown className="text-orange-500"/>} 
                    />
                </div>
            </div>
            <div className="lg:col-span-1 bg-white shadow-lg rounded-xl p-6 flex flex-col max-h-[860px]">
                <div className="flex-1 flex flex-col min-h-0">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Best Performing Subjects</h2>
                    <div className="overflow-y-auto flex-1 custom-scrollbar -mr-2 pr-2">
                        {statistics.bestPerformingSubjects.length > 0 ? (
                            statistics.bestPerformingSubjects.map(subj => (
                              <SubjectDetailCard 
                                key={subj.id} 
                                subject={subj} 
                                onClick={() => handleSubjectClick(subj)} 
                              />
                            ))
                        ) : (
                            <EmptyState message="No subjects match filters."/>
                        )}
                    </div>
                </div>
                <div className="my-4 border-t"></div>
                <div className="flex-1 flex flex-col min-h-0">
                     <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Least Performing Subjects</h2>
                     <div className="overflow-y-auto flex-1 custom-scrollbar -mr-2 pr-2">
                        {statistics.leastPerformingSubjects.length > 0 ? (
                            statistics.leastPerformingSubjects.map(subj => (
                              <SubjectDetailCard 
                                key={subj.id} 
                                subject={subj} 
                                onClick={() => handleSubjectClick(subj)} 
                              />
                            ))
                        ) : (
                            <EmptyState message="No subjects match filters."/>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </main>
      {selectedSubject && (
        <SubjectInstructorsModal 
          subject={selectedSubject} 
          onClose={handleCloseModal} 
        />
      )}
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
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        disabled={disabled} 
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm disabled:bg-gray-100"
      >
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
    </div>
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
                        <p className="text-xs text-gray-500">{inst.dept} &bull; {inst.reviews} reviews</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <Link 
                          to={`/adm-instructor-list/${inst.id}`} 
                          title="View Profile" 
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                        >
                            <FiExternalLink className="w-5 h-5" />
                        </Link>
                        <p className={`text-lg font-bold w-12 text-right ${getScoreStyle(inst.average).color}`}>
                          {inst.average.toFixed(2)}
                        </p>
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
    <button 
      onClick={onClick} 
      className="w-full text-left p-3 rounded-lg mb-2 border border-gray-200 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
        <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate" title={subject.name}>{subject.name}</p>
                <p className="text-xs text-gray-500">{subject.course} &bull; {subject.reviews} reviews</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
                <div 
                  title={getScoreStyle(subject.average).text} 
                  className={`font-bold text-lg px-3 py-1 rounded-full ${getScoreStyle(subject.average).bg} ${getScoreStyle(subject.average).color}`}
                >
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
                        <li key={inst.in_instructorid} className="flex items-center p-2.5 bg-gray-50 rounded-lg border">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{`${inst.in_fname} ${inst.in_lname}`}</p>
                                <p className="text-xs text-gray-500">{inst.in_dept}</p>
                            </div>
                            <Link 
                              to={`/adm-instructor-list/${inst.in_instructorid}`} 
                              title="View Profile" 
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                            >
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

const EmptyState = ({ message }) => (
  <div className="text-center py-10">
    <p className="text-gray-500 italic">{message}</p>
  </div>
);