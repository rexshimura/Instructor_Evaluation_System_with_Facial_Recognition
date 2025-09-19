const evaluationQuestions = [
  {
    // C1: Course Organization and Content
    // Questions in this category evaluate how well the course was designed.
    category: "Course Organization and Content",
    questions: [
      { id: 1, text: "The course objectives were clearly communicated." },
      { id: 2, text: "The course materials (e.g., readings, handouts, etc.) were relevant and useful." },
      { id: 3, text: "The course was well-organized and easy to follow." },
    ],
  },
  {
    // C2: Instructor's Knowledge and Presentation
    // This category assesses the instructor's knowledge and teaching style.
    category: "Instructor's Knowledge and Presentation",
    questions: [
      { id: 4, text: "The instructor demonstrated a strong knowledge of the subject matter." },
      { id: 5, text: "The instructor's explanations were clear and easy to understand." },
      { id: 6, text: "The instructor used effective teaching methods to help me learn." },
    ],
  },
  {
    // C3: Communication and Interaction
    // Questions here measure how the instructor interacted with students and facilitated learning.
    category: "Communication and Interaction",
    questions: [
      { id: 7, text: "The instructor was responsive to student questions." },
      { id: 8, text: "The instructor created a respectful and supportive learning environment." },
      { id: 9, text: "The instructor encouraged student participation in class discussions." },
    ],
  },
  {
    // C4: Assessment and Feedback
    // This category evaluates how students were assessed throughout the course.
    category: "Assessment and Feedback",
    questions: [
      { id: 10, text: "The grading criteria for assignments and exams were clear." },
      { id: 11, text: "The feedback I received on my work was timely and helpful." },
      { id: 12, text: "The assessments (e.g., exams, projects) were a fair reflection of the course content." },
    ],
  },
  {
    // C5: Overall Effectiveness
    // These are broad, summary questions to gauge overall satisfaction and effectiveness.
    category: "Overall Effectiveness",
    questions: [
      { id: 13, text: "Overall, I would rate the instructor's teaching effectiveness as excellent." },
      { id: 14, text: "I would recommend this instructor to other students." },
      { id: 15, text: "The course helped me gain a deeper understanding of the subject." },
    ],
  },
];

// Remarks
const remarksQuestion = {
  id: 16,
  text: "REMARKS (Student Comment)",
};

export { evaluationQuestions, remarksQuestion };
