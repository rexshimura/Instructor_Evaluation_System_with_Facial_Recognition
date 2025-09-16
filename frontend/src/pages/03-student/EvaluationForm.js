import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import instructors from '../../data/instructors';
import subjectLoadData from '../../data/subjectload';
import LoadingOverlay from '../../components/module_feedback/LoadingOverlay';
import ScoreSelector from '../../components/module_selector/ScoreSelector';
import EvaluationFormNavBar from '../../components/module_layout/EvaluationFormNavBar';
import ScrollToTopButton from '../../components/module_feedback/ScrollToTopButton';

// Data for evaluation questions
const evaluationQuestions = [
  { id: 'q1_effectiveness', question: '1. The instructor presents the subject matter clearly and effectively.' },
  { id: 'q2_engagement', question: '2. The instructor encourages student participation and engagement.' },
  { id: 'q3_understanding', question: '3. The instructor identifies the needs, interests, and capacities of individual students and provides adequate support.' },
  { id: 'q4_knowledge', question: '4. The instructor demonstrates mastery of the subject matter.' },
  { id: 'q5_organization', question: '5. The instructor organizes the course content logically and coherently.' },
  { id: 'q6_feedback', question: '6. The instructor provides timely and constructive feedback on assignments and assessments.' },
  { id: 'q7_availability', question: '7. The instructor is accessible and responsive to student inquiries.' },
  { id: 'q8_fairness', question: '8. The instructor treats students fairly and respectfully.' },
  { id: 'q9_motivation', question: '9. The instructor motivates students to learn and explore the subject further.' },
  { id: 'q10_resources', question: '10. The instructor provides and recommends useful learning materials and resources.' },
  { id: 'q11_clarity', question: '11. The instructor explains concepts in a way that is easy to understand.' },
  { id: 'q12_examples', question: '12. The instructor uses relevant examples to illustrate key points.' },
  { id: 'q13_classroom_management', question: '13. The instructor manages the classroom environment effectively.' },
  { id: 'q14_interaction', question: '14. The instructor encourages questions and promotes meaningful discussions.' },
  { id: 'q15_assessment', question: '15. The instructor evaluates students fairly and according to clear criteria.' }
];

export default function EvaluationForm() {
  const { instructorID, subjectID } = useParams();
  const navigate = useNavigate();

  const [scores, setScores] = useState(
    evaluationQuestions.reduce((acc, q) => ({ ...acc, [q.id]: 0 }), {})
  );
  const [isLoading, setIsLoading] = useState(false);

  const instructor = instructors.find(inst => inst.instructorID === instructorID);
  const subject = subjectLoadData.find(
    sub => sub.subjectID === subjectID && sub.instructorID === instructorID
  );

  if (!instructor || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-lg">
        Evaluation information not found.
      </div>
    );
  }

  const redactedEmail = `${instructor.email.substring(0, 3)}***@***${instructor.email.split('@')[1]}`;
  const redactedContact = `${instructor.contactNumber.substring(0, 2)}***${instructor.contactNumber.substring(instructor.contactNumber.length - 2)}`;

  const handleScoreChange = (questionId, score) => {
    setScores(prev => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Check if all questions have been answered
  const allAnswered = Object.values(scores).every(score => score > 0);
  if (!allAnswered) {
    alert("Please answer all evaluation questions before submitting.");
    return;
  }

  setIsLoading(true);

  const evaluationData = {
    instructorID: instructorID,
    subjectID: subjectID,
    evaluationDate: new Date().toISOString(),
    scores: scores,
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
                alt={`${instructor.fname} ${instructor.lname}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
              />
              <div>
                <h2 className="text-2xl font-bold">
                  {instructor.fname} {instructor.mname[0] ? instructor.mname[0] + "." : ""} {instructor.lname} {instructor.suffix}
                </h2>
                <p className="text-gray-600">{instructor.department}</p>
              </div>
            </div>

            {/* Subject Info */}
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-lg mb-6">
              <p className="font-bold text-lg">
                <span className="text-blue-600">Subject:</span> {subject.subjectName} ({subject.miscode})
              </p>
              <p className="text-sm">
                <span className="font-semibold text-blue-600">Course & Year:</span> {subject.course}, Year {subject.year}
              </p>
            </div>

            {/* Contact Info */}
            <div className="border-t pt-4">
              <p className="text-gray-700 text-sm opacity-60"><strong>Email:</strong> {redactedEmail}</p>
              <p className="text-gray-700 text-sm opacity-60"><strong>Contact:</strong> {redactedContact}</p>
            </div>
          </div>

          {/* Evaluation Questions */}
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Evaluation</h3>
            {evaluationQuestions.map(q => (
              <div key={q.id} className="mb-8">
                <label className="block text-gray-700 font-semibold mb-6">{q.question}</label>
                <ScoreSelector
                  questionId={q.id}
                  currentScore={scores[q.id]}
                  onSelectScore={handleScoreChange}
                />
              </div>
            ))}
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
