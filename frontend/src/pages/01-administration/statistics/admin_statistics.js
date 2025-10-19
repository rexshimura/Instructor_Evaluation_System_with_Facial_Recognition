import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminNavBar from "../../../components/module_layout/AdminNavBar";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Radar } from 'react-chartjs-2';
import { FiFilter, FiTrendingUp, FiTrendingDown, FiSmile, FiFrown, FiMeh, FiUsers, FiExternalLink, FiBookOpen, FiX, FiAward, FiHelpCircle, FiBriefcase, FiUserCheck, FiRefreshCw } from "react-icons/fi";
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

// FIXED: Use lowercase field names to match your database
const EVALUATION_CATEGORIES = [
    { name: 'Commitment', field: 'ev_c1' },
    { name: 'Knowledge', field: 'ev_c2' },
    { name: 'Teaching', field: 'ev_c3' },
    { name: 'Management', field: 'ev_c4' },
    { name: 'Personal Qualities', field: 'ev_c5' }
];

// ===================================================================
// --- DEBUG COMPONENT ---
// ===================================================================

const DebugPanel = ({ data, statistics, filters }) => {
  const [showDebug, setShowDebug] = useState(false);
  
  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-lg text-xs z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-4 bg-black bg-opacity-90 z-50 overflow-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl">Debug Panel</h2>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-white bg-red-600 px-3 py-1 rounded"
        >
          Close
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white text-sm">
        <div>
          <h3 className="font-bold mb-2">Data Counts:</h3>
          <pre>{JSON.stringify({
            students: data.students?.length || 0,
            evaluations: data.evaluations?.length || 0,
            instructors: data.instructors?.length || 0,
            subjects: data.subjects?.length || 0,
            moderators: data.moderators?.length || 0
          }, null, 2)}</pre>
        </div>
        
        <div>
          <h3 className="font-bold mb-2">Filters:</h3>
          <pre>{JSON.stringify(filters, null, 2)}</pre>
        </div>
        
        <div className="md:col-span-2">
          <h3 className="font-bold mb-2">Statistics Summary:</h3>
          <pre>{JSON.stringify({
            numberOfResponses: statistics.numberOfResponses,
            topPerformersCount: statistics.topPerformers?.length || 0,
            needsAttentionCount: statistics.needsAttention?.length || 0,
            bestSubjectsCount: statistics.bestPerformingSubjects?.length || 0,
            worstSubjectsCount: statistics.leastPerformingSubjects?.length || 0,
            categoryScores: statistics.averageCategoryScores
          }, null, 2)}</pre>
        </div>
        
        <div>
          <h3 className="font-bold mb-2">Sample Evaluation:</h3>
          <pre>{JSON.stringify(data.evaluations?.[0] || 'No evaluations', null, 2)}</pre>
        </div>
        
        <div>
          <h3 className="font-bold mb-2">Sample Student:</h3>
          <pre>{JSON.stringify(data.students?.[0] || 'No students', null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// --- MAIN COMPONENT: AdminStatistics Dashboard ---
// ===================================================================

export default function AdminStatistics() {
  const [filters, setFilters] = useState({ course: 'All', year: 'All', semester: 'All', subject: 'All' });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    admins: [],
    moderators: [],
    students: [],
    evaluations: [],
    instructors: [],
    subjects: [],
    instructorSubjects: []
  });

  // Enhanced fetchData with better error handling
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Starting data fetch...');
      
      const [
        moderatorsRes,
        studentsRes,
        evaluationsRes,
        instructorsRes,
        subjectsRes,
        instructorSubjectsRes
      ] = await Promise.all([
        axios.get(`${API_BASE}/moderators`).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/students`).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/evaluations`).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/instructors`).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/subjects`).catch(err => ({ data: [] })),
        axios.get(`${API_BASE}/instructor-subject`).catch(err => ({ data: [] }))
      ]);

      console.log('📊 Raw API Responses Count:', {
        students: studentsRes.data?.length || 0,
        evaluations: evaluationsRes.data?.length || 0,
        instructors: instructorsRes.data?.length || 0,
        subjects: subjectsRes.data?.length || 0,
        moderators: moderatorsRes.data?.length || 0,
        instructorSubjects: instructorSubjectsRes.data?.length || 0
      });

      // Enhanced data processing with validation
      const processedData = {
        admins: [],
        moderators: Array.isArray(moderatorsRes.data) ? moderatorsRes.data : [],
        students: Array.isArray(studentsRes.data) ? studentsRes.data : [],
        evaluations: Array.isArray(evaluationsRes.data) ? evaluationsRes.data : [],
        instructors: Array.isArray(instructorsRes.data) ? instructorsRes.data : [],
        subjects: Array.isArray(subjectsRes.data) ? subjectsRes.data : [],
        instructorSubjects: Array.isArray(instructorSubjectsRes.data) ? instructorSubjectsRes.data : []
      };

      // Enhanced debugging: Check evaluation field names
      if (processedData.evaluations.length > 0) {
        console.log('📝 Sample Evaluation Fields:', Object.keys(processedData.evaluations[0]));
        console.log('📝 Sample Evaluation Scores:', {
          ev_c1: processedData.evaluations[0].ev_c1,
          ev_c2: processedData.evaluations[0].ev_c2,
          ev_c3: processedData.evaluations[0].ev_c3,
          ev_c4: processedData.evaluations[0].ev_c4,
          ev_c5: processedData.evaluations[0].ev_c5
        });
      }

      setData(processedData);
      
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setError("Failed to load dashboard data. Please check if the backend server is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('✅ Data fetch completed');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Enhanced statistics calculation with better debugging
  const statistics = useMemo(() => {
    console.log('🧮 Calculating statistics...');
    
    if (loading) {
      return getEmptyStatistics();
    }

    // Enhanced data validation
    if (!data.evaluations || !Array.isArray(data.evaluations) || data.evaluations.length === 0) {
      console.log('⚠️ No evaluations data found');
      return getEmptyStatistics();
    }

    console.log('🔍 Processing with filters:', filters);

    // Enhanced student filtering
    const filteredStudents = data.students.filter(s => {
      if (!s) return false;
      
      const courseMatch = filters.course === 'All' || s.stud_course === filters.course;
      const yearMatch = filters.year === 'All' || s.stud_year?.toString() === filters.year;
      const semesterMatch = filters.semester === 'All' || s.stud_semester?.toString() === filters.semester;
      
      return courseMatch && yearMatch && semesterMatch;
    });

    console.log(`👥 Filtered students: ${filteredStudents.length}`);

    const filteredStudentIds = new Set(
      filteredStudents
        .map(s => s?.stud_id?.toString())
        .filter(id => id && id !== 'undefined')
    );

    console.log(`🎯 Student IDs to match: ${Array.from(filteredStudentIds).join(', ')}`);

    // Enhanced evaluation filtering
    const filteredEvaluations = data.evaluations.filter(e => {
      if (!e) return false;
      
      const evalStudentId = e.stud_id?.toString();
      const studentMatch = filteredStudentIds.size === 0 || filteredStudentIds.has(evalStudentId);
      const subjectMatch = filters.subject === 'All' || e.sub_id?.toString() === filters.subject;
      
      return studentMatch && subjectMatch;
    });

    console.log(`📈 Filtered evaluations: ${filteredEvaluations.length}`);

    // Enhanced subject options
    const subjectOptions = data.subjects
      .filter(s => {
        if (!s) return false;
        return filters.course === 'All' || s.sub_course === filters.course;
      })
      .map(s => ({ 
        id: s.sub_id?.toString() || 'unknown', 
        name: s.sub_name || 'Unknown Subject' 
      }));

    console.log(`📚 Subject options: ${subjectOptions.length}`);

    // Enhanced sentiment analysis
    const remarks = filteredEvaluations
      .map(e => e.ev_remark)
      .filter(remark => remark && typeof remark === 'string' && remark.trim() !== '');
    
    const sentimentSummary = analyzeRemarks(remarks);
    const totalRemarks = sentimentSummary.positiveCount + sentimentSummary.negativeCount + sentimentSummary.neutralCount;
    
    sentimentSummary.positivePercentage = totalRemarks > 0 ? (sentimentSummary.positiveCount / totalRemarks) * 100 : 0;
    sentimentSummary.negativePercentage = totalRemarks > 0 ? (sentimentSummary.negativeCount / totalRemarks) * 100 : 0;
    sentimentSummary.neutralPercentage = totalRemarks > 0 ? (sentimentSummary.neutralCount / totalRemarks) * 100 : 0;

    console.log('😊 Sentiment:', sentimentSummary);

    // Enhanced metrics calculation with detailed debugging
    const { instructorMetrics, subjectMetrics } = calculateMetrics(
      filteredEvaluations, 
      data.instructors, 
      data.subjects
    );

    const instructorBreakdown = Object.entries(instructorMetrics).map(([id, data]) => ({
      id,
      name: data.name,
      dept: data.dept,
      average: data.reviewCount > 0 ? parseFloat((data.totalScore / data.reviewCount).toFixed(2)) : 0,
      reviews: data.reviewCount
    }));

    const subjectBreakdown = Object.entries(subjectMetrics).map(([id, data]) => ({
      id,
      name: data.name,
      course: data.course,
      average: data.reviewCount > 0 ? parseFloat((data.totalScore / data.reviewCount).toFixed(2)) : 0,
      reviews: data.reviewCount,
      instructorIds: Array.from(data.instructorIds || new Set())
    }));

    // Enhanced leaderboard with impact score
    const leaderboard = instructorBreakdown.map(inst => ({
      ...inst,
      impactScore: inst.average * Math.log10(inst.reviews + 1)
    }));

    // Enhanced category scores calculation
    const averageCategoryScores = calculateCategoryScores(filteredEvaluations);

    console.log('📊 Final statistics:', {
      evaluationsCount: filteredEvaluations.length,
      instructorCount: instructorBreakdown.length,
      subjectCount: subjectBreakdown.length,
      categoryScores: averageCategoryScores,
      topPerformers: leaderboard.slice(0, 3).map(p => ({ name: p.name, score: p.average })),
      needsAttention: leaderboard.filter(inst => inst.average < 3).slice(0, 3).map(p => ({ name: p.name, score: p.average }))
    });

    return {
      subjectOptions,
      sentimentSummary,
      averageCategoryScores,
      bestPerformingSubjects: subjectBreakdown
        .filter(s => s.average > 0)
        .sort((a, b) => b.average - a.average)
        .slice(0, 10),
      leastPerformingSubjects: subjectBreakdown
        .filter(s => s.average > 0)
        .sort((a, b) => a.average - b.average)
        .slice(0, 10),
      numberOfResponses: filteredEvaluations.length,
      topPerformers: leaderboard
        .filter(inst => inst.average > 0)
        .sort((a, b) => b.impactScore - a.impactScore)
        .slice(0, 3),
      needsAttention: leaderboard
        .filter(inst => inst.average > 0 && inst.average < 3)
        .sort((a, b) => a.average - b.average)
        .slice(0, 5),
    };
  }, [filters, data, loading]);

  // Helper function for empty statistics
  function getEmptyStatistics() {
    const emptyCategoryScores = EVALUATION_CATEGORIES.reduce((acc, cat) => {
      acc[cat.name] = 0;
      return acc;
    }, {});
    
    return {
      subjectOptions: [],
      sentimentSummary: { 
        positiveCount: 0, 
        negativeCount: 0, 
        neutralCount: 0, 
        positivePercentage: 0, 
        negativePercentage: 0, 
        neutralPercentage: 0 
      },
      averageCategoryScores: emptyCategoryScores,
      bestPerformingSubjects: [],
      leastPerformingSubjects: [],
      numberOfResponses: 0,
      topPerformers: [],
      needsAttention: []
    };
  }

  // Helper function for metrics calculation with enhanced debugging
  function calculateMetrics(evaluations, instructors, subjects) {
    const instructorMetrics = {};
    const subjectMetrics = {};

    console.log('🔍 Starting metrics calculation with:', {
      evaluationsCount: evaluations.length,
      instructorsCount: instructors.length,
      subjectsCount: subjects.length
    });

    evaluations.forEach((ev, index) => {
      if (!ev) return;
      
      // FIXED: Use lowercase field names
      const { ins_id, sub_id, ev_c1, ev_c2, ev_c3, ev_c4, ev_c5 } = ev;
      
      console.log(`📋 Processing evaluation ${index + 1}:`, {
        ev_id: ev.ev_id,
        ins_id: ev.ins_id,
        sub_id: ev.sub_id,
        scores: {
          ev_c1: ev.ev_c1,
          ev_c2: ev.ev_c2,
          ev_c3: ev.ev_c3,
          ev_c4: ev.ev_c4,
          ev_c5: ev.ev_c5
        }
      });

      // Enhanced score validation with lowercase fields
      const scores = [ev_c1, ev_c2, ev_c3, ev_c4, ev_c5]
        .map(score => {
          const num = parseFloat(score);
          const isValid = !isNaN(num) && num >= 1 && num <= 5;
          console.log(`🔢 Score ${score}: parsed=${num}, valid=${isValid}`);
          return isValid ? num : null;
        })
        .filter(score => score !== null);
      
      console.log(`✅ Valid scores for evaluation ${ev.ev_id}:`, scores);

      if (scores.length === 0) {
        console.log(`❌ Evaluation ${ev.ev_id}: No valid scores found`);
        return;
      }

      const currentScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      console.log(`📊 Evaluation ${ev.ev_id}: Average score = ${currentScore.toFixed(2)}`);

      // Enhanced instructor metrics with detailed debugging
      if (ins_id) {
        const instructorId = ins_id.toString();
        console.log(`👨‍🏫 Processing instructor ID: ${instructorId}`);
        
        // Use loose comparison to handle string/number mismatches
        const info = instructors.find(i => i && (i.ins_id == instructorId || i.ins_id?.toString() === instructorId));

        if (!info) {
          console.log(`❌ Instructor ${instructorId} not found in instructors list`);
          console.log('Available instructors:', instructors.map(i => ({ id: i.ins_id, name: `${i.ins_fname} ${i.ins_lname}` })));
        } else {
          console.log(`✅ Found instructor: ${info.ins_fname} ${info.ins_lname}`);
        }

        if (!instructorMetrics[instructorId]) {
          instructorMetrics[instructorId] = { 
            name: info ? `${info.ins_fname || ''} ${info.ins_lname || ''}`.trim() : 'Unknown Instructor',
            dept: info?.ins_dept || 'N/A', 
            totalScore: 0, 
            reviewCount: 0 
          };
          console.log(`📊 Created instructor metric for ${instructorId}: ${instructorMetrics[instructorId].name}`);
        }
        instructorMetrics[instructorId].totalScore += currentScore;
        instructorMetrics[instructorId].reviewCount += 1;
        console.log(`📈 Updated instructor ${instructorId}: totalScore = ${instructorMetrics[instructorId].totalScore.toFixed(2)}, reviews = ${instructorMetrics[instructorId].reviewCount}`);
      } else {
        console.log(`❌ Evaluation ${ev.ev_id}: No instructor ID found`);
      }

      // Enhanced subject metrics with detailed debugging
      if (sub_id) {
        const subjectId = sub_id.toString();
        console.log(`📚 Processing subject ID: ${subjectId}`);
        
        // Use loose comparison to handle string/number mismatches
        const subjectInfo = subjects.find(s => s && (s.sub_id == subjectId || s.sub_id?.toString() === subjectId));

        if (!subjectInfo) {
          console.log(`❌ Subject ${subjectId} not found in subjects list`);
          console.log('Available subjects:', subjects.map(s => ({ id: s.sub_id, name: s.sub_name })));
        } else {
          console.log(`✅ Found subject: ${subjectInfo.sub_name}`);
        }

        if (!subjectMetrics[subjectId]) {
          subjectMetrics[subjectId] = { 
            name: subjectInfo?.sub_name || 'Unknown Subject', 
            course: subjectInfo?.sub_course || 'N/A', 
            totalScore: 0, 
            reviewCount: 0, 
            instructorIds: new Set() 
          };
          console.log(`📊 Created subject metric for ${subjectId}: ${subjectMetrics[subjectId].name}`);
        }
        subjectMetrics[subjectId].totalScore += currentScore;
        subjectMetrics[subjectId].reviewCount += 1;
        if (ins_id) {
          subjectMetrics[subjectId].instructorIds.add(ins_id);
          console.log(`📈 Updated subject ${subjectId}: totalScore = ${subjectMetrics[subjectId].totalScore.toFixed(2)}, reviews = ${subjectMetrics[subjectId].reviewCount}, instructors = ${Array.from(subjectMetrics[subjectId].instructorIds)}`);
        }
      } else {
        console.log(`❌ Evaluation ${ev.ev_id}: No subject ID found`);
      }
    });

    console.log('📊 Final metrics summary:', {
      instructorMetricsCount: Object.keys(instructorMetrics).length,
      subjectMetricsCount: Object.keys(subjectMetrics).length,
      instructorDetails: instructorMetrics,
      subjectDetails: subjectMetrics
    });

    return { instructorMetrics, subjectMetrics };
  }

  // Helper function for category scores with lowercase fields
  function calculateCategoryScores(evaluations) {
    const overallCategoryTotals = {};
    EVALUATION_CATEGORIES.forEach(cat => {
      overallCategoryTotals[cat.name] = { total: 0, count: 0 };
    });

    console.log('📈 Calculating category scores from', evaluations.length, 'evaluations');

    evaluations.forEach((ev, index) => {
      EVALUATION_CATEGORIES.forEach(cat => {
        const score = ev[cat.field]; // This now uses lowercase fields (ev_c1, ev_c2, etc.)
        const numScore = parseFloat(score);
        if (!isNaN(numScore) && numScore >= 1 && numScore <= 5) {
          overallCategoryTotals[cat.name].total += numScore;
          overallCategoryTotals[cat.name].count += 1;
        }
      });
    });

    const averageCategoryScores = {};
    EVALUATION_CATEGORIES.forEach(cat => {
      averageCategoryScores[cat.name] = overallCategoryTotals[cat.name].count > 0 
        ? parseFloat((overallCategoryTotals[cat.name].total / overallCategoryTotals[cat.name].count).toFixed(2))
        : 0;
    });

    console.log('📊 Category scores result:', averageCategoryScores);
    console.log('📊 Category totals:', overallCategoryTotals);

    return averageCategoryScores;
  }

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, ...(name === 'course' && { subject: 'All' }) }));
  };

  const clearFilters = () => {
    setFilters({ course: 'All', year: 'All', semester: 'All', subject: 'All' });
  };

  const handleSubjectClick = (subject) => {
    const instructors = (subject.instructorIds || []).map(id => 
      data.instructors.find(inst => inst && inst.ins_id === id)
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
    return parts.join(' • ') || 'Overall Statistics';
  }, [filters, statistics.subjectOptions]);

  const performanceChartData = {
    labels: Object.keys(statistics.averageCategoryScores),
    datasets: [{
      label: 'Average Score', 
      data: Object.values(statistics.averageCategoryScores).map(s => parseFloat(s.toFixed(2))),
      backgroundColor: 'rgba(79, 70, 229, 0.2)', 
      borderColor: 'rgba(79, 70, 229, 1)', 
      borderWidth: 2,
      pointBackgroundColor: 'rgba(79, 70, 229, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(79, 70, 229, 1)'
    }],
  };

  const chartOptions = { 
    maintainAspectRatio: false, 
    scales: { 
      r: { 
        beginAtZero: true, 
        max: 5,
        ticks: {
          stepSize: 1,
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      } 
    }, 
    plugins: { 
      legend: { display: false }, 
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white'
      },
      datalabels: { 
        backgroundColor: 'rgba(79, 70, 229, 0.8)', 
        color: 'white', 
        borderRadius: 4, 
        font: { weight: 'bold', size: 11 }, 
        padding: { top: 4, bottom: 2, left: 6, right: 6 },
        formatter: (value) => value.toFixed(1)
      } 
    } 
  };

  // Test function to load sample data
  const loadSampleData = () => {
    console.log('🧪 Loading sample data for testing...');
    const sampleData = {
      admins: [],
      moderators: [{ mod_id: 1, mod_username: 'test' }],
      students: [
        { 
          stud_id: 1, 
          stud_fname: 'Test', 
          stud_lname: 'Student', 
          stud_course: 'BSIT', 
          stud_year: 1, 
          stud_semester: 1 
        }
      ],
      evaluations: [
        {
          ev_id: 1,
          stud_id: 1,
          ins_id: 1,
          sub_id: 1,
          ev_c1: 4.5, // lowercase
          ev_c2: 4.0, // lowercase
          ev_c3: 4.5, // lowercase
          ev_c4: 4.0, // lowercase
          ev_c5: 4.5, // lowercase
          ev_remark: 'Great instructor!',
          ev_subject: 'Test Subject'
        }
      ],
      instructors: [
        { 
          ins_id: 1, 
          ins_fname: 'Test', 
          ins_lname: 'Instructor', 
          ins_dept: 'BSIT' 
        }
      ],
      subjects: [
        { 
          sub_id: 1, 
          sub_name: 'Test Subject', 
          sub_course: 'BSIT' 
        }
      ],
      instructorSubjects: []
    };
    
    setData(sampleData);
    setFilters({ course: 'BSIT', year: '1', semester: '1', subject: '1' });
  };

  if (loading && !refreshing) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <AdminNavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">{error}</p>
            <button 
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={loadSampleData}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-2"
            >
              Load Sample Data
            </button>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Performance & Engagement Dashboard</h1>
              <p className="mt-1 text-gray-500">Drill-down analytics for faculty evaluation data.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={loadSampleData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Test Data
              </button>
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
              >
                <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
                Refresh Data
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SystemStatCard label="Total Admins" count={1} icon={<FiBriefcase className="text-indigo-600 text-xl" />} />
            <SystemStatCard label="Total Moderators" count={data.moderators.length} to="/adm-moderator-list" icon={<FiUserCheck className="text-indigo-600 text-xl" />} />
            <SystemStatCard label="Total Instructors" count={data.instructors.length} to="/adm-instructor-list" icon={<FiAward className="text-indigo-600 text-xl" />} />
            <SystemStatCard label="Total Students" count={data.students.length} icon={<FiUsers className="text-indigo-600 text-xl" />} />
        </div>

        {/* Filters Section */}
        <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center">
              <FiFilter className="text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {statistics.numberOfResponses} evaluation{statistics.numberOfResponses !== 1 ? 's' : ''} found
              </div>
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FilterDropdown 
              label="Course" 
              name="course" 
              value={filters.course} 
              onChange={handleFilterChange} 
              options={[
                { id: 'All', name: 'All Courses' }, 
                { id: 'BSIT', name: 'BSIT' }, 
                { id: 'BSIS', name: 'BSIS' },
                { id: 'BSCS', name: 'BSCS' }
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

        {/* Data Status Alert */}
        {statistics.numberOfResponses === 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiHelpCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  No evaluation data found
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This could be because:
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    <li>No evaluations have been submitted yet</li>
                    <li>Your filters are too restrictive</li>
                    <li>There's an issue with the data connection</li>
                  </ul>
                  <p className="mt-2">
                    Try adjusting your filters or check the backend server.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white shadow-lg rounded-xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-gray-800">Performance by Category</h2>
                  <InfoTooltip text="This chart shows the average evaluation score across five key categories based on the current filters." />
                </div>
                <p className="text-sm text-gray-500 mb-4 truncate" title={performanceChartTitle}>
                  {performanceChartTitle}
                </p>
                <div className="w-full h-80">
                  {statistics.numberOfResponses > 0 ? (
                    <Radar data={performanceChartData} options={chartOptions} />
                  ) : (
                    <EmptyState message="No evaluation data available for current filters." />
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
                    icon={<FiSmile className="text-green-500 text-2xl"/>} 
                    label="Positive Remarks" 
                    count={statistics.sentimentSummary.positiveCount} 
                    percentage={statistics.sentimentSummary.positivePercentage}
                  />
                  <SentimentCard 
                    icon={<FiFrown className="text-red-500 text-2xl"/>} 
                    label="Negative Remarks" 
                    count={statistics.sentimentSummary.negativeCount} 
                    percentage={statistics.sentimentSummary.negativePercentage}
                  />
                  <SentimentCard 
                    icon={<FiMeh className="text-yellow-500 text-2xl"/>} 
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
                icon={<FiTrendingUp className="text-green-500 text-xl"/>} 
              />
              <InstructorLeaderboard 
                title="Needs Attention" 
                instructors={statistics.needsAttention} 
                icon={<FiTrendingDown className="text-orange-500 text-xl"/>} 
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
                  <EmptyState message="No subjects match current filters."/>
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
                  <EmptyState message="No subjects match current filters."/>
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
      
      <DebugPanel data={data} statistics={statistics} filters={filters} />
      
      <footer className="bg-white text-center py-4 border-t border-gray-200 mt-auto">
        <p className="text-sm text-gray-600">© {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)</p>
      </footer>
    </div>
  );
}

// --- Reusable Sub-components for the Dashboard ---
const InfoTooltip = ({ text }) => (
  <div className="relative group flex items-center">
    <FiHelpCircle className="text-gray-400 hover:text-gray-600 cursor-pointer text-sm" />
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        disabled={disabled} 
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.name}</option>
        ))}
      </select>
    </div>
);

const SentimentCard = ({ icon, label, count, percentage }) => (
    <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="mr-4">{icon}</div>
        <div className="flex-1">
            <p className="text-gray-600 text-sm font-medium">{label}</p>
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
                <div>{icon}</div>
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            </div>
            {title === "Top Performers" && <InfoTooltip text="Highlights the top 3 instructors based on a weighted score that considers both average rating and number of reviews." />}
            {title === "Needs Attention" && <InfoTooltip text="Lists instructors with an average evaluation score of 3.0 or below." />}
        </div>
        <ul className="space-y-3 flex-1 pr-2 -mr-2 custom-scrollbar overflow-y-auto">
            {instructors.length > 0 ? instructors.map(inst => (
                <li key={inst.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-700 truncate">{inst.name}</p>
                        <p className="text-xs text-gray-500">{inst.dept} &bull; {inst.reviews} review{inst.reviews !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                        <Link 
                          to={`/adm-instructor-list/${inst.id}`} 
                          title="View Profile" 
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
                        >
                            <FiExternalLink className="w-4 h-4" />
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
      className="w-full text-left p-4 rounded-lg mb-3 border border-gray-200 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
    >
        <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate text-sm" title={subject.name}>{subject.name}</p>
                <p className="text-xs text-gray-500 mt-1">{subject.course} &bull; {subject.reviews} review{subject.reviews !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
                <div 
                  title={getScoreStyle(subject.average).text} 
                  className={`font-bold text-sm px-2 py-1 rounded-full ${getScoreStyle(subject.average).bg} ${getScoreStyle(subject.average).color}`}
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
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 z-10">
                    <FiX size={20} />
                </button>
                <div className="flex items-center mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3"><FiBookOpen className="text-indigo-600" /></div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 truncate">{subject.name}</h3>
                        <p className="text-sm text-gray-500">Instructors for this subject</p>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                  <ul className="space-y-2">
                    {subject.instructors && subject.instructors.length > 0 ? subject.instructors.map(inst => (
                        <li key={inst.ins_id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{`${inst.ins_fname} ${inst.ins_lname}`}</p>
                                <p className="text-xs text-gray-500 truncate">{inst.ins_dept}</p>
                            </div>
                            <Link 
                              to={`/adm-instructor-list/${inst.ins_id}`} 
                              title="View Profile" 
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors flex-shrink-0"
                            >
                                <FiExternalLink className="w-4 h-4" />
                            </Link>
                        </li>
                    )) : (
                        <li className="text-gray-500 italic text-center py-8">No instructors found for this subject.</li>
                    )}
                  </ul>
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ message }) => (
  <div className="text-center py-8">
    <p className="text-gray-500 italic">{message}</p>
  </div>
);