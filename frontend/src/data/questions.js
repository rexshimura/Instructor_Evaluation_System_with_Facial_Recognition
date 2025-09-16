// src/data/questions.js

const evaluationQuestions = [
  {
    category: "Course Organization and Content",
    questions: [
      { id: 1, text: "The course objectives were clearly communicated." },
      { id: 2, text: "The course materials (e.g., readings, handouts, etc.) were relevant and useful." },
      { id: 3, text: "The course was well-organized and easy to follow." },
    ],
  },
  {
    category: "Instructor's Knowledge and Presentation",
    questions: [
      { id: 4, text: "The instructor demonstrated a strong knowledge of the subject matter." },
      { id: 5, text: "The instructor's explanations were clear and easy to understand." },
      { id: 6, text: "The instructor used effective teaching methods to help me learn." },
    ],
  },
  {
    category: "Communication and Interaction",
    questions: [
      { id: 7, text: "The instructor was responsive to student questions." },
      { id: 8, text: "The instructor created a respectful and supportive learning environment." },
      { id: 9, text: "The instructor encouraged student participation in class discussions." },
    ],
  },
  {
    category: "Assessment and Feedback",
    questions: [
      { id: 10, text: "The grading criteria for assignments and exams were clear." },
      { id: 11, text: "The feedback I received on my work was timely and helpful." },
      { id: 12, text: "The assessments (e.g., exams, projects) were a fair reflection of the course content." },
    ],
  },
  {
    category: "Overall Effectiveness",
    questions: [
      { id: 13, text: "Overall, I would rate the instructor's teaching effectiveness as excellent." },
      { id: 14, text: "I would recommend this instructor to other students." },
    ],
  },
];

const remarksQuestion = {
  id: 15,
  text: "REMARKS (Student Comment)",
};

export { evaluationQuestions, remarksQuestion };