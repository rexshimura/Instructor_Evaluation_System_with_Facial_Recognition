import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingOverlay from '../../components/module_feedback/LoadingOverlay';
import ScoreSelector from '../../components/module_selector/ScoreSelector';
import EvaluationFormNavBar from '../../components/module_layout/EvaluationFormNavBar';
import ScrollToTopButton from '../../components/module_feedback/ScrollToTopButton';
import axios from 'axios';

// Import the categorized questions and remarks question
import { evaluationQuestions, remarksQuestion } from '../../data/questions';

// Helper object to display full category names
const categoryDetails = {
  C1: { title: "Course Organization and Content", description: "This category evaluates how well the course was designed." },
  C2: { title: "Instructor's Knowledge and Presentation", description: "This category assesses the instructor's knowledge and teaching style." },
  C3: { title: "Communication and Interaction", description: "This category measures how the instructor interacted with students and facilitated learning." },
  C4: { title: "Assessment and Feedback", description: "This category evaluates how students were assessed throughout the course." },
  C5: { title: "Overall Effectiveness", description: "These are broad, summary questions to gauge overall satisfaction and effectiveness." },
};

// Map category names to database column names
const categoryToDbMap = {
  "Course Organization and Content": "C1",
  "Instructor's Knowledge and Presentation": "C2", 
  "Communication and Interaction": "C3",
  "Assessment and Feedback": "C4",
  "Overall Effectiveness": "C5"
};

export default function EvaluationForm() {
  const { instructorID, subjectID } = useParams();
  const navigate = useNavigate();

  // Memoize student data to prevent unnecessary re-renders
  const student = useMemo(() => {
    const userString = sessionStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  }, []);

  // Flatten the questions to initialize the scores state
  const allQuestions = useMemo(() => 
    evaluationQuestions.flatMap(category => category.questions), 
  []);

  const [scores, setScores] = useState(
    allQuestions.reduce((acc, q) => ({ ...acc, [q.id]: 0 }), {})
  );
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructor, setInstructor] = useState(null);
  const [subject, setSubject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch instructor and subject data
    const fetchData = async () => {
      if (!instructorID || !subjectID) {
        setError("Missing instructor or subject information");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const [instrRes, subRes] = await Promise.all([
          axios.get(`/instructors/${instructorID}`),
          axios.get(`/subjects/${subjectID}`)
        ]);

        setInstructor(instrRes.data);
        setSubject(subRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load evaluation data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [instructorID, subjectID]);

  const handleScoreChange = (questionId, score) => {
    setScores(prev => ({ ...prev, [questionId]: score }));
  };

  // Calculate if form is valid
  const isFormValid = useMemo(() => {
    const allQuestionsAnswered = Object.values(scores).every(score => score > 0);
    return allQuestionsAnswered && student;
  }, [scores, student]);

  // Calculate category scores
  const categoryScores = useMemo(() => {
    const scoresObj = {};
    evaluationQuestions.forEach(category => {
      const categoryQuestionIds = category.questions.map(q => q.id);
      const categoryScoreValues = categoryQuestionIds.map(id => scores[id]).filter(score => score > 0);
      
      if (categoryScoreValues.length > 0) {
        const average = categoryScoreValues.reduce((sum, score) => sum + score, 0) / categoryScoreValues.length;
        const dbColumn = categoryToDbMap[category.category];
        scoresObj[dbColumn] = parseFloat(average.toFixed(2));
      } else {
        const dbColumn = categoryToDbMap[category.category];
        scoresObj[dbColumn] = 0;
      }
    });
    return scoresObj;
  }, [scores]);

  // Calculate total rating
  const totalRating = useMemo(() => {
    const validScores = Object.values(categoryScores).filter(score => score > 0);
    if (validScores.length === 0) return 0;
    
    const total = validScores.reduce((sum, score) => sum + score, 0);
    return parseFloat((total / validScores.length).toFixed(3));
  }, [categoryScores]);

  // Calculate completion percentage - MOVED BEFORE ANY CONDITIONAL RETURNS
  const completionPercentage = useMemo(() => {
    const answered = Object.values(scores).filter(score => score > 0).length;
    return Math.round((answered / allQuestions.length) * 100);
  }, [scores, allQuestions.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      if (!student) {
        alert("⚠️ Please log in to submit evaluation.");
        return;
      }
      
      const unansweredCount = Object.values(scores).filter(score => score === 0).length;
      alert(`⚠️ Please answer all ${unansweredCount} remaining evaluation questions before submitting.`);
      return;
    }

    // Check evaluation eligibility before submitting
    try {
      const eligibilityRes = await axios.get(
        `/evaluations/check-eligibility/${student.stud_id}/${instructorID}/${subjectID}`
      );
      
      if (!eligibilityRes.data.canEvaluate) {
        alert("❌ You are not eligible to evaluate this instructor for this subject, or you have already submitted an evaluation.");
        return;
      }
    } catch (err) {
      console.error("Error checking eligibility:", err);
      alert("⚠️ Could not verify evaluation eligibility. Please try again.");
      return;
    }

    // Prepare evaluation data according to your database schema
    const evaluationData = {
      sub_id: parseInt(subjectID),
      stud_id: parseInt(student.stud_id),
      ins_id: parseInt(instructorID),
      ev_C1: categoryScores.C1 || 0,
      ev_C2: categoryScores.C2 || 0,
      ev_C3: categoryScores.C3 || 0,
      ev_C4: categoryScores.C4 || 0,
      ev_C5: categoryScores.C5 || 0,
      ev_total_rating: totalRating,
      ev_semester: parseInt(student.stud_semester),
      ev_remark: remarks.trim()
    };

    try {
      setIsSubmitting(true);
      const res = await axios.post("/evaluations", evaluationData);
      
      alert(res.data.message || "✅ Evaluation submitted successfully!");
      navigate("/home");
    } catch (err) {
      console.error("Submission error:", err);
      
      if (err.response?.data?.error) {
        alert(`❌ Failed to submit evaluation: ${err.response.data.error}`);
      } else if (err.code === 'NETWORK_ERROR') {
        alert("❌ Network error. Please check your connection and try again.");
      } else {
        alert("❌ Failed to submit evaluation. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingOverlay message="Loading evaluation form..." />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <EvaluationFormNavBar />
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Form</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show form not ready state
  if (!instructor || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingOverlay message="Preparing evaluation form..." />
      </div>
    );
  }

  const redactedEmail = instructor.ins_email ? 
    `${instructor.ins_email.substring(0, 3)}***@***${instructor.ins_email.split('@')[1]}` : 
    'N/A';
    
  const redactedContact = instructor.ins_contact ? 
    `${instructor.ins_contact.substring(0, 2)}***${instructor.ins_contact.substring(instructor.ins_contact.length - 2)}` : 
    'N/A';

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {(isLoading || isSubmitting) && (
        <LoadingOverlay message={isSubmitting ? "Submitting evaluation..." : "Loading..."} />
      )}

      <EvaluationFormNavBar />

      <div className="flex-1 flex flex-col items-center p-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Evaluate an Instructor</h1>
        
        {/* Progress Indicator */}
        <div className="w-full max-w-2xl mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Form Completion: {completionPercentage}%
              </span>
              <span className="text-sm text-gray-500">
                {Object.values(scores).filter(score => score > 0).length} of {allQuestions.length} questions answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          {/* Instructor and Subject Info Card */}
          <div className="bg-white shadow-lg rounded-lg p-6 w-full mb-8">
            <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-200">
              <img
                src="/profiles/profile-default.png"
                alt={`${instructor.ins_fname} ${instructor.ins_lname}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {instructor.ins_fname}{" "}
                  {instructor.ins_mname ? instructor.ins_mname[0] + "." : ""}{" "}
                  {instructor.ins_lname} {instructor.ins_suffix || ""}
                </h2>
                <p className="text-gray-600">{instructor.ins_dept}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p><strong>Email:</strong> {redactedEmail}</p>
                  <p><strong>Contact:</strong> {redactedContact}</p>
                </div>
              </div>
            </div>

            {/* Subject Info */}
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-lg">
              <p className="font-bold text-lg">
                <span className="text-blue-600">Subject:</span>{" "}
                {subject.sub_name} ({subject.sub_miscode})
              </p>
              <p className="text-sm">
                <span className="font-semibold text-blue-600">Course & Year:</span>{" "}
                {subject.sub_course}, Year {subject.sub_year}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-blue-600">Units:</span>{" "}
                {subject.sub_units} units • Semester {subject.sub_semester}
              </p>
            </div>
          </div>

          {/* Evaluation Questions by Category */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Instructor Evaluation
            </h3>
            
            {evaluationQuestions.map(category => {
              const dbCategory = categoryToDbMap[category.category];
              const categoryScore = categoryScores[dbCategory];
              
              return (
                <div key={category.category} className="mb-10 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      {categoryDetails[dbCategory]?.title || category.category}
                    </h4>
                    <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                      {categoryDetails[dbCategory]?.description}
                    </p>
                    {categoryScore > 0 && (
                      <div className="mt-2 inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Category Score: {categoryScore}
                      </div>
                    )}
                  </div>
                  
                  {category.questions.map(q => (
                    <div
                      key={q.id}
                      className="mb-8 text-center flex flex-col items-center"
                    >
                      <label className="block text-gray-700 font-semibold mb-4 max-w-xl text-lg">
                        {q.text}
                      </label>
                      <ScoreSelector
                        questionId={q.id}
                        currentScore={scores[q.id]}
                        onSelectScore={handleScoreChange}
                      />
                      {scores[q.id] > 0 && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          Selected: {scores[q.id]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Remarks Section */}
            <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
              <label htmlFor="remarks" className="block text-gray-700 font-semibold mb-4 text-center text-lg">
                {remarksQuestion.text}
              </label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                rows="4"
                placeholder="Share your additional comments, suggestions, or feedback about the instructor and course..."
                maxLength="250"
              ></textarea>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Optional comments</span>
                <span>{remarks.length}/250 characters</span>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-blue-800 text-lg mb-2">Evaluation Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Overall Rating:</span>{' '}
                  {totalRating > 0 ? totalRating.toFixed(2) : 'Not calculated'}
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className={isFormValid ? "text-green-600 font-bold" : "text-orange-600 font-bold"}>
                    {isFormValid ? 'Ready to Submit' : 'Incomplete'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`font-bold py-3 px-8 rounded-lg transition-all duration-200 text-lg ${
                !isFormValid || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
              }`}
            >
              {isSubmitting ? 'Submitting Evaluation...' : 
               isFormValid ? `Submit Evaluation (${totalRating.toFixed(2)})` : 
               'Complete All Questions to Submit'}
            </button>
            
            {!isFormValid && (
              <p className="text-sm text-gray-500 mt-3">
                Please answer all questions to submit your evaluation
              </p>
            )}
          </div>
        </form>
      </div>

      <ScrollToTopButton />
    </div>
  );
}