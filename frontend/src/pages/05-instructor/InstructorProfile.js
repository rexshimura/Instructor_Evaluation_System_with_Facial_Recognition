import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import VerifyNavBar from "../../components/module_layout/VerifyNavBar";
import instructors from "../../data/instructors";
import subjectLoad from "../../data/subjectload";
import analyzeRemarks from "../../utils/remarkAnalyzer";
import calculatePerformance from "../../utils/performanceCalculator";

// Helper function to convert score to a descriptive word
const getScoreWord = (score) => {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Very Good";
  if (score >= 2.5) return "Average";
  if (score >= 1.5) return "Needs Improvement";
  return "Poor";
};

export default function InstructorProfile() {
  const { instructorID } = useParams();

  // Correct: All hooks are called at the top level
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [displayedData, setDisplayedData] = useState(null);

  const instructor = instructors.find((inst) => inst.instructorID === instructorID);
  const subjects = subjectLoad.filter((sub) => sub.instructorID === instructorID);

  // Use useMemo to prevent calculatePerformance from running on every render
  const performanceData = useMemo(() => calculatePerformance(instructorID), [instructorID]);

  useEffect(() => {
    if (!performanceData) {
      setDisplayedData(null);
      return;
    }

    if (selectedSubjectId) {
      const subjectData = performanceData.performanceBySubject[selectedSubjectId];
      if (subjectData) {
        setDisplayedData({
          averageCategoryScores: subjectData.averageCategoryScores,
          remarks: subjectData.remarks,
          totalReviews: subjectData.evaluations.length,
        });
      }
    } else {
      setDisplayedData({
        averageCategoryScores: performanceData.overallAverageCategoryScores,
        remarks: performanceData.overallRemarks,
        totalReviews: performanceData.totalEvaluations,
      });
    }
  }, [selectedSubjectId, performanceData]);


  // Conditional return comes after all hooks
  if (!instructor) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <VerifyNavBar />
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-red-600">Instructor Not Found</h2>
          <p className="text-gray-600 mt-2">
            The profile you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  const remarksSummary = displayedData ? analyzeRemarks(displayedData.remarks) : null;

  const getBarWidth = (score) => {
    const percentage = (score / 5) * 100;
    return `${percentage}%`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <VerifyNavBar />
      <div className="relative w-full max-w-7xl bg-white rounded-lg shadow-xl p-8 mt-16">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Instructor Profile</h2>
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-800">
            {`${instructor.fname} ${instructor.mname ? instructor.mname + ' ' : ''}${instructor.lname}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p>
                <strong>ID:</strong> {instructor.instructorID}
              </p>
              <p>
                <strong>Department:</strong> {instructor.department}
              </p>
              <p>
                <strong>Email:</strong> {instructor.email}
              </p>
            </div>
            <div>
              <p>
                <strong>Contact:</strong> {instructor.contactNumber}
              </p>
              <p>
                <strong>Sex:</strong> {instructor.sex}
              </p>
              <p>
                <strong>Date of Birth:</strong> {instructor.dob}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-800">
            Subjects Handled
          </h3>
          <div className="flex flex-wrap gap-4">
            <div
              className={`flex-none cursor-pointer p-4 rounded-lg shadow-sm border ${!selectedSubjectId ? 'bg-blue-50 border-blue-600 font-bold' : 'bg-gray-50'}`}
              onClick={() => setSelectedSubjectId(null)}
            >
              <p className="font-medium text-lg text-gray-800">View All</p>
                <p className="text-sm text-gray-600">View Overall Performance</p>
            </div>
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <div
                  key={subject.subjectID}
                  className={`flex-none cursor-pointer p-4 rounded-lg shadow-sm border ${selectedSubjectId === subject.subjectID ? 'bg-blue-50 border-blue-600 font-bold' : 'bg-gray-50'}`}
                  onClick={() => setSelectedSubjectId(subject.subjectID)}
                >
                  <p className="font-medium text-lg text-gray-800">{subject.subjectName}</p>
                  <p className="text-sm text-gray-600">
                    {`MIS Code: ${subject.miscode} | Course: ${subject.course} | Semester: ${subject.semester}`}
                  </p>
                </div>
              ))
            ) : null}
          </div>
          {subjects.length === 0 && (
            <p className="text-gray-500 text-center mt-4">
              No subjects found for this instructor.
            </p>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-4 border-b pb-2 text-gray-800">
            Performance Metrics
          </h3>
          {displayedData ? (
            <div className="space-y-6">
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-lg font-bold text-blue-800 mb-4">
                  {selectedSubjectId ?
                    `Performance for ${subjects.find(s => s.subjectID === selectedSubjectId).subjectName}`
                    : 'Overall Performance'
                  } ({displayedData.totalReviews} reviews)
                </p>

                <div className="max-w-2xl mx-auto space-y-4">
                  {Object.entries(displayedData.averageCategoryScores).map(([category, score]) => (
                    <div key={category}>
                      <p className="text-sm font-semibold text-gray-700">
                        {category}: {getScoreWord(score)} ({score})
                      </p>
                      <div className="bg-gray-200 rounded-full h-4 mt-1">
                        <div
                          className="bg-blue-500 rounded-full h-4 transition-all duration-500"
                          style={{ width: getBarWidth(score) }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {remarksSummary && displayedData.totalReviews > 0 && (
                  <div className="mt-8">
                    <p className="text-lg font-bold text-gray-800 mb-2">Remarks Summary</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-green-200 p-3 rounded-lg text-center">
                        <p className="text-xl">✅</p>
                        <p className="text-sm font-semibold text-green-800 mt-1">Positive</p>
                        <p className="text-xl font-bold">{remarksSummary.positiveCount}</p>
                      </div>
                      <div className="bg-red-200 p-3 rounded-lg text-center">
                        <p className="text-xl">❌</p>
                        <p className="text-sm font-semibold text-red-800 mt-1">Negative</p>
                        <p className="text-xl font-bold">{remarksSummary.negativeCount}</p>
                      </div>
                      <div className="bg-yellow-200 p-3 rounded-lg text-center">
                        <p className="text-xl">⚪</p>
                        <p className="text-sm font-semibold text-yellow-800 mt-1">Neutral</p>
                        <p className="text-xl font-bold">{remarksSummary.neutralCount}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <p className="text-lg font-bold text-gray-800 mb-2">Remarks</p>
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {displayedData.remarks.filter(remark => remark.trim() !== '').length > 0 ? (
                      displayedData.remarks.filter(remark => remark.trim() !== '').map((remark, index) => (
                        <li key={index} className="bg-white p-3 rounded-lg text-gray-700 italic">
                          "{remark}"
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-center">No remarks available for this view.</p>
                    )}
                  </ul>
                </div>

              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic text-center">
              Performance data is not yet available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}