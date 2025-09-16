const evaluations = [
  // =========================================================================
  // Evaluations for Maria Santos (INS01)
  // =========================================================================
  {
    evaluationID: "EVAL001", studentID: "20210001", instructorID: "INS01", subjectID: "SUB03", semester: 1, year: 2,
    scores: { q1: 4, q2: 5, q3: 4, q4: 5, q5: 4, q6: 5, q7: 3, q8: 4, q9: 4, q10: 5, q11: 4, q12: 5, q13: 5, q14: 4 },
    remarks: "The instructor was very knowledgeable and the course content was well-structured. I learned a lot from her teaching methods.",
  },
  {
    evaluationID: "EVAL002", studentID: "20210002", instructorID: "INS01", subjectID: "SUB03", semester: 1, year: 2,
    scores: { q1: 5, q2: 4, q3: 5, q4: 5, q5: 5, q6: 4, q7: 5, q8: 5, q9: 5, q10: 4, q11: 5, q12: 4, q13: 5, q14: 5 },
    remarks: "Excellent teacher. She is very approachable and creates a fun learning environment.",
  },
  {
    evaluationID: "EVAL003", studentID: "20210008", instructorID: "INS01", subjectID: "SUB03", semester: 1, year: 2,
    scores: { q1: 4, q2: 4, q3: 4, q4: 4, q5: 4, q6: 4, q7: 4, q8: 4, q9: 4, q10: 4, q11: 4, q12: 4, q13: 4, q14: 4 },
    remarks: "The class was good but the quizzes were bad at the same time. Mixed feelings.",
  },
  {
    evaluationID: "EVAL004", studentID: "20210001", instructorID: "INS01", subjectID: "SUB04", semester: 1, year: 2,
    scores: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5, q11: 5, q12: 5, q13: 5, q14: 5 },
    remarks: "A very clear and helpful instructor. The discussions were very insightful.",
  },
  {
    evaluationID: "EVAL005", studentID: "20210002", instructorID: "INS01", subjectID: "SUB04", semester: 1, year: 2,
    scores: { q1: 4, q2: 4, q3: 4, q4: 5, q5: 4, q6: 4, q7: 5, q8: 4, q9: 4, q10: 5, q11: 4, q12: 5, q13: 4, q14: 5 },
    remarks: "I really enjoyed this course, the topics were relevant and engaging.",
  },
  {
    evaluationID: "EVAL006", studentID: "20210008", instructorID: "INS01", subjectID: "SUB04", semester: 1, year: 2,
    scores: { q1: 3, q2: 3, q3: 4, q4: 3, q5: 3, q6: 4, q7: 3, q8: 3, q9: 4, q10: 3, q11: 3, q12: 4, q13: 3, q14: 3 },
    remarks: "Some parts of the lessons were a bit confusing but I managed to catch up.",
  },
  // =========================================================================
  // Evaluations for James Reyes (INS02)
  // =========================================================================
  {
    evaluationID: "EVAL007", studentID: "20210002", instructorID: "INS02", subjectID: "SUB01", semester: 1, year: 3,
    scores: { q1: 5, q2: 5, q3: 4, q4: 5, q5: 4, q6: 5, q7: 5, q8: 4, q9: 5, q10: 5, q11: 4, q12: 5, q13: 5, q14: 5 },
    remarks: "The instructor is great, very knowledgeable and passionate about Database Systems.",
  },
  {
    evaluationID: "EVAL008", studentID: "20210009", instructorID: "INS02", subjectID: "SUB01", semester: 1, year: 3,
    scores: { q1: 3, q2: 4, q3: 3, q4: 4, q5: 3, q6: 4, q7: 3, q8: 4, q9: 3, q10: 4, q11: 3, q12: 4, q13: 3, q14: 4 },
    remarks: "His explanations were a bit confusing at times, but he's very fair with grading.",
  },
  {
    evaluationID: "EVAL009", studentID: "1348317", instructorID: "INS02", subjectID: "SUB01", semester: 1, year: 3,
    scores: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5, q11: 5, q12: 5, q13: 5, q14: 5 },
    remarks: "Excellent teacher! His approach is highly approachable and he makes the subject fun.",
  },
  {
    evaluationID: "EVAL010", studentID: "20210001", instructorID: "INS02", subjectID: "SUB02", semester: 1, year: 2,
    scores: { q1: 1, q2: 2, q3: 1, q4: 2, q5: 1, q6: 2, q7: 1, q8: 1, q9: 2, q10: 1, q11: 2, q12: 1, q13: 1, q14: 2 },
    remarks: "His teaching style was confusing and the subject material was difficult to follow.",
  },
  {
    evaluationID: "EVAL011", studentID: "20210008", instructorID: "INS02", subjectID: "SUB02", semester: 1, year: 2,
    scores: { q1: 4, q2: 4, q3: 5, q4: 4, q5: 5, q6: 4, q7: 4, q8: 5, q9: 4, q10: 5, q11: 4, q12: 4, q13: 5, q14: 4 },
    remarks: "He is not a bad teacher, the discussions were helpful.",
  },
  {
    evaluationID: "EVAL012", studentID: "20210009", instructorID: "INS02", subjectID: "SUB02", semester: 1, year: 2,
    scores: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3, q11: 3, q12: 3, q13: 3, q14: 3 },
    remarks: "The class was good but the quizzes were bad. Mixed feelings.",
  },
  // =========================================================================
  // Evaluations for Gwapo Lawas (INS03)
  // =========================================================================
  {
    evaluationID: "EVAL013", studentID: "20210002", instructorID: "INS03", subjectID: "SUB05", semester: 1, year: 3,
    scores: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5, q11: 5, q12: 5, q13: 5, q14: 5 },
    remarks: "This instructor is the best! Truly passionate about the subject. Highly recommended.",
  },
  {
    evaluationID: "EVAL014", studentID: "20210009", instructorID: "INS03", subjectID: "SUB05", semester: 1, year: 3,
    scores: { q1: 4, q2: 4, q3: 4, q4: 4, q5: 4, q6: 4, q7: 4, q8: 4, q9: 4, q10: 4, q11: 4, q12: 4, q13: 4, q14: 4 },
    remarks: "The subject was very technical but the instructor made it easy to understand. He is patient and helpful.",
  },
  {
    evaluationID: "EVAL015", studentID: "1348317", instructorID: "INS03", subjectID: "SUB05", semester: 1, year: 3,
    scores: { q1: 5, q2: 4, q3: 5, q4: 4, q5: 5, q6: 4, q7: 5, q8: 4, q9: 5, q10: 4, q11: 5, q12: 4, q13: 5, q14: 4 },
    remarks: "Instructor is very approachable and makes the subject fun. I would take another class with him.",
  },
  {
    evaluationID: "EVAL016", studentID: "20210001", instructorID: "INS03", subjectID: "SUB06", semester: 1, year: 1,
    scores: { q1: 3, q2: 4, q3: 3, q4: 4, q5: 3, q6: 4, q7: 3, q8: 4, q9: 3, q10: 4, q11: 3, q12: 4, q13: 3, q14: 4 },
    remarks: "The lessons were okay, but sometimes I felt lost. The examples were not very clear.",
  },
  {
    evaluationID: "EVAL017", studentID: "20210008", instructorID: "INS03", subjectID: "SUB06", semester: 1, year: 1,
    scores: { q1: 2, q2: 3, q3: 2, q4: 3, q5: 2, q6: 3, q7: 2, q8: 3, q9: 2, q10: 3, q11: 2, q12: 3, q13: 2, q14: 3 },
    remarks: "Very difficult to follow. The pace was too fast and I couldn't keep up with the topics.",
  },
  {
    evaluationID: "EVAL018", studentID: "20210009", instructorID: "INS03", subjectID: "SUB06", semester: 1, year: 1,
    scores: { q1: 4, q2: 5, q3: 4, q4: 5, q5: 4, q6: 5, q7: 4, q8: 5, q9: 4, q10: 5, q11: 4, q12: 5, q13: 4, q14: 5 },
    remarks: "I really enjoyed this class. The instructor was engaging and made the subject simple to understand.",
  },
  // =========================================================================
  // Evaluations for Joehanes Lauglaug (INS04)
  // =========================================================================
  {
    evaluationID: "EVAL019", studentID: "20210002", instructorID: "INS04", subjectID: "SUB07", semester: 1, year: 2,
    scores: { q1: 3, q2: 4, q3: 3, q4: 4, q5: 3, q6: 4, q7: 3, q8: 4, q9: 3, q10: 4, q11: 3, q12: 4, q13: 3, q14: 4 },
    remarks: "The professor had good intentions but the topics were a little dry. I think we need more real-world examples.",
  },
  {
    evaluationID: "EVAL020", studentID: "20210008", instructorID: "INS04", subjectID: "SUB07", semester: 1, year: 2,
    scores: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5, q11: 5, q12: 5, q13: 5, q14: 5 },
    remarks: "A very fair and compassionate instructor. All of his lessons were clear and concise. I had a great time.",
  },
  {
    evaluationID: "EVAL021", studentID: "20210009", instructorID: "INS04", subjectID: "SUB07", semester: 1, year: 2,
    scores: { q1: 4, q2: 4, q3: 4, q4: 4, q5: 4, q6: 4, q7: 4, q8: 4, q9: 4, q10: 4, q11: 4, q12: 4, q13: 4, q14: 4 },
    remarks: "The lectures were engaging and easy to follow. I appreciated the feedback on my assignments.",
  },
  {
    evaluationID: "EVAL022", studentID: "20210002", instructorID: "INS04", subjectID: "SUB08", semester: 1, year: 2,
    scores: { q1: 4, q2: 4, q3: 4, q4: 4, q5: 4, q6: 4, q7: 4, q8: 4, q9: 4, q10: 4, q11: 4, q12: 4, q13: 4, q14: 4 },
    remarks: "The content was very relevant, and the instructor was passionate. However, the tests were a little too hard.",
  },
  {
    evaluationID: "EVAL023", studentID: "20210008", instructorID: "INS04", subjectID: "SUB08", semester: 1, year: 2,
    scores: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5, q11: 5, q12: 5, q13: 5, q14: 5 },
    remarks: "Best teacher ever! He makes complex subjects simple and fun. I learned so much.",
  },
  {
    evaluationID: "EVAL024", studentID: "20210009", instructorID: "INS04", subjectID: "SUB08", semester: 1, year: 2,
    scores: { q1: 3, q2: 3, q3: 3, q4: 3, q5: 3, q6: 3, q7: 3, q8: 3, q9: 3, q10: 3, q11: 3, q12: 3, q13: 3, q14: 3 },
    remarks: "The lectures were a bit dry and difficult to stay focused on. The quizzes were fair.",
  },
  {
    evaluationID: "EVAL025", studentID: "20210002", instructorID: "INS04", subjectID: "SUB09", semester: 1, year: 1,
    scores: { q1: 5, q2: 4, q3: 5, q4: 4, q5: 5, q6: 4, q7: 5, q8: 4, q9: 5, q10: 4, q11: 5, q12: 4, q13: 5, q14: 4 },
    remarks: "Very approachable and helpful. The instructor was responsive to all of our questions.",
  },
  {
    evaluationID: "EVAL026", studentID: "20210008", instructorID: "INS04", subjectID: "SUB09", semester: 1, year: 1,
    scores: { q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5, q11: 5, q12: 5, q13: 5, q14: 5 },
    remarks: "His teaching methods were clear, concise, and easy to follow. I recommend him for this subject.",
  },
  {
    evaluationID: "EVAL027", studentID: "20210009", instructorID: "INS04", subjectID: "SUB09", semester: 1, year: 1,
    scores: { q1: 2, q2: 2, q3: 2, q4: 2, q5: 2, q6: 2, q7: 2, q8: 2, q9: 2, q10: 2, q11: 2, q12: 2, q13: 2, q14: 2 },
    remarks: "The classes were not engaging and I found the subject material difficult to follow. The grading was unfair.",
  },
];

export default evaluations;