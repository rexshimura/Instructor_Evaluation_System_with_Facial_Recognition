import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import instructorData from '../../data/list-instructors';
import subjectLoad from '../../data/list-subjects';
import LoadingOverlay from '../../components/module_feedback/LoadingOverlay';
import ScoreSelector from '../../components/module_selector/ScoreSelector';
import EvaluationFormNavBar from '../../components/module_layout/EvaluationFormNavBar';
import ScrollToTopButton from '../../components/module_feedback/ScrollToTopButton';

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

export default function EvaluationForm() {
  const { instructorID, subjectID } = useParams();
  const navigate = useNavigate();

  // Flatten the questions to initialize the scores state
  const allQuestions = evaluationQuestions.flatMap(category => category.questions);

  const [scores, setScores] = useState(
    allQuestions.reduce((acc, q) => ({ ...acc, [q.id]: 0 }), {})
  );
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Match how StudentInstructorListPage passes params
  const instructor = instructorData.find(
    inst => String(inst.in_instructorID) === String(instructorID)
  );

  const subject = subjectLoad.find(
    sub => String(sub.sb_subID) === String(subjectID)
  );

  if (!instructor || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        Evaluation information not found.
      </div>
    );
  }

  const redactedEmail = `${instructor.in_email.substring(0, 3)}***@***${instructor.in_email.split('@')[1]}`;
  const redactedContact = `${instructor.in_cnum.substring(0, 2)}***${instructor.in_cnum.substring(instructor.in_cnum.length - 2)}`;

  const handleScoreChange = (questionId, score) => {
    setScores(prev => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allAnswered = Object.values(scores).every(score => score > 0);
    if (!allAnswered) {
      alert("Please answer all evaluation questions before submitting.");
      return;
    }

    setIsLoading(true);

    const evaluationData = {
      instructorID: instructor.in_instructorID,
      subjectID: subject.sb_subID,
      evaluationDate: new Date().toISOString(),
      scores: scores,
      remarks: remarks,
    };

    console.log("Submitting Evaluation:", evaluationData);

    try {
      const res = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluationData),
      });

      const data = await res.json();
      console.log("Server Response:", data);

      alert("Evaluation submitted successfully!");
      navigate("/Home");
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      alert("There was an error submitting the evaluation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {isLoading && <LoadingOverlay message="Submitting evaluation..." />}

      <EvaluationFormNavBar />

      <div className="flex-1 flex flex-col items-center p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Evaluate an Instructor</h1>

        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full mb-8">
            {/* Instructor Info */}
            <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-200">
              <img
                src={instructor.face || "/default-face.png"}
                alt={`${instructor.in_fname} ${instructor.in_lname}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
              />
              <div>
                <h2 className="text-2xl font-bold">
                  {instructor.in_fname}{" "}
                  {instructor.in_mname ? instructor.in_mname[0] + "." : ""}{" "}
                  {instructor.in_lname} {instructor.in_suffix}
                </h2>
                <p className="text-gray-600">{instructor.in_dept}</p>
              </div>
            </div>

            {/* Subject Info */}
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-lg mb-6">
              <p className="font-bold text-lg">
                <span className="text-blue-600">Subject:</span>{" "}
                {subject.sb_name} ({subject.sb_miscode})
              </p>
              <p className="text-sm">
                <span className="font-semibold text-blue-600">Course & Year:</span>{" "}
                {subject.sb_course}, Year {subject.sb_year}
              </p>
            </div>

            {/* Contact Info */}
            <div className="border-t pt-4">
              <p className="text-gray-700 text-sm opacity-60"><strong>Email:</strong> {redactedEmail}</p>
              <p className="text-gray-700 text-sm opacity-60"><strong>Contact:</strong> {redactedContact}</p>
            </div>
          </div>

          {/* Evaluation Questions by Category */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Evaluation</h3>
            {evaluationQuestions.map(category => (
              <div key={category.category} className="mb-10 p-4 border rounded-lg">
                <h4 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  {categoryDetails[category.category]?.title || category.category}
                </h4>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  {categoryDetails[category.category]?.description}
                </p>
                {category.questions.map(q => (
                  <div
                    key={q.id}
                    className="mb-8 text-center flex flex-col items-center"
                  >
                    <label className="block text-gray-700 font-semibold mb-6 max-w-xl">
                      {q.text}
                    </label>
                    <ScoreSelector
                      questionId={q.id}
                      currentScore={scores[q.id]}
                      onSelectScore={handleScoreChange}
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* Remarks Section */}
            <div className="mb-10 p-4 border rounded-lg">
              <label htmlFor="remarks" className="block text-gray-700 font-semibold mb-4 text-center">
                {remarksQuestion.text}
              </label>
              <textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Enter your comments here..."
                maxLength="250"
              ></textarea>
              <div className="text-right text-sm text-gray-500 mt-1">
                {remarks.length}/250
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`font-bold py-2 px-6 rounded-lg transition-colors duration-200 ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isLoading ? 'Submitting...' : 'Submit Evaluation'}
            </button>
          </div>
        </form>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
