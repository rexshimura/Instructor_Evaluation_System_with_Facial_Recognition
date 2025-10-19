import React from "react";
import StudentNavBar from "../../components/module_layout/StudentNavBar";
import { FiInfo, FiCheckCircle, FiXCircle, FiAlertTriangle, FiBook, FiUser, FiStar, FiClock, FiShield } from "react-icons/fi";

export default function EvaluationGuidelines() {
  const userString = sessionStorage.getItem("user");
  const student = userString ? JSON.parse(userString) : null;

  // Add this check for access control
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-600">Access Denied. Please log in.</p>
      </div>
    );
  }

  const evaluationCriteria = [
    {
      id: 1,
      code: "C1",
      title: "Subject Knowledge",
      description: "Instructor's mastery and depth of understanding of the subject matter",
      indicators: [
        "Demonstrates comprehensive knowledge of the subject",
        "Provides accurate and up-to-date information",
        "Relates theoretical concepts to practical applications",
        "Answers student questions effectively"
      ],
      ratingScale: {
        "5 - Excellent": "Exceptional command of subject with real-world insights",
        "4 - Very Good": "Strong knowledge with good practical examples",
        "3 - Good": "Adequate knowledge of core concepts",
        "2 - Fair": "Basic understanding with some gaps",
        "1 - Poor": "Limited knowledge of subject matter"
      }
    },
    {
      id: 2,
      code: "C2",
      title: "Teaching Methods",
      description: "Effectiveness of instructional strategies and delivery methods",
      indicators: [
        "Uses varied teaching methods to engage students",
        "Presents material in an organized and logical manner",
        "Encourages student participation and interaction",
        "Provides clear explanations and examples"
      ],
      ratingScale: {
        "5 - Excellent": "Highly innovative and engaging teaching methods",
        "4 - Very Good": "Effective methods that maintain student interest",
        "3 - Good": "Standard methods with adequate engagement",
        "2 - Fair": "Limited variety in teaching approaches",
        "1 - Poor": "Ineffective or monotonous teaching methods"
      }
    },
    {
      id: 3,
      code: "C3",
      title: "Classroom Management",
      description: "Ability to maintain productive learning environment",
      indicators: [
        "Starts and ends classes on time",
        "Maintains discipline and order in class",
        "Manages time effectively during sessions",
        "Creates a conducive learning atmosphere"
      ],
      ratingScale: {
        "5 - Excellent": "Exceptional classroom control and time management",
        "4 - Very Good": "Well-managed classroom with minimal disruptions",
        "3 - Good": "Adequate management with occasional issues",
        "2 - Fair": "Poor time management or classroom control",
        "1 - Poor": "Consistent issues with classroom management"
      }
    },
    {
      id: 4,
      code: "C4",
      title: "Communication Skills",
      description: "Clarity and effectiveness in conveying information",
      indicators: [
        "Speaks clearly and audibly",
        "Explains concepts in understandable terms",
        "Uses appropriate language and terminology",
        "Listens attentively to student concerns"
      ],
      ratingScale: {
        "5 - Excellent": "Outstanding communication with exceptional clarity",
        "4 - Very Good": "Clear and effective communication skills",
        "3 - Good": "Generally clear with occasional confusion",
        "2 - Fair": "Communication issues that hinder understanding",
        "1 - Poor": "Poor communication affecting learning"
      }
    },
    {
      id: 5,
      code: "C5",
      title: "Professionalism",
      description: "Professional conduct and commitment to teaching",
      indicators: [
        "Shows enthusiasm and passion for teaching",
        "Maintains professional appearance and demeanor",
        "Shows respect for all students",
        "Adheres to institutional policies and ethics"
      ],
      ratingScale: {
        "5 - Excellent": "Exemplary professional conduct and dedication",
        "4 - Very Good": "Highly professional with strong commitment",
        "3 - Good": "Meets basic professional standards",
        "2 - Fair": "Occasional lapses in professional conduct",
        "1 - Poor": "Unprofessional behavior or attitude"
      }
    }
  ];

  const doDontItems = {
    do: [
      "Evaluate based on actual classroom experiences",
      "Provide honest and constructive feedback",
      "Consider the entire semester's performance",
      "Focus on specific teaching behaviors and methods",
      "Submit evaluations before the deadline"
    ],
    dont: [
      "Evaluate based on personal likes or dislikes",
      "Let one incident overshadow overall performance",
      "Discuss your evaluation with other students",
      "Submit multiple evaluations for the same instructor",
      "Wait until the last minute to submit"
    ]
  };

  const faqItems = [
    {
      question: "How often can I evaluate an instructor?",
      answer: "You can evaluate each instructor-subject combination once per semester. After submission, you cannot modify your evaluation."
    },
    {
      question: "Are my evaluations anonymous?",
      answer: "Yes, all evaluations are completely anonymous. Instructors only see aggregated results and cannot identify individual students."
    },
    {
      question: "What happens if I miss the evaluation deadline?",
      answer: "Late submissions are not accepted. Make sure to complete your evaluations during the designated evaluation period."
    },
    {
      question: "Can I evaluate instructors from previous semesters?",
      answer: "No, you can only evaluate instructors for your current enrolled sections in the active semester."
    },
    {
      question: "How are the evaluation results used?",
      answer: "Results are used for faculty development, performance improvement, and institutional planning. They help maintain teaching quality standards."
    }
  ];

  const ratingSystem = [
    { rating: 5, label: "Excellent", description: "Exceptional performance exceeding expectations", color: "text-green-600 bg-green-100" },
    { rating: 4, label: "Very Good", description: "Strong performance meeting all expectations", color: "text-blue-600 bg-blue-100" },
    { rating: 3, label: "Good", description: "Satisfactory performance meeting basic expectations", color: "text-yellow-600 bg-yellow-100" },
    { rating: 2, label: "Fair", description: "Performance needing some improvement", color: "text-orange-600 bg-orange-100" },
    { rating: 1, label: "Poor", description: "Performance requiring significant improvement", color: "text-red-600 bg-red-100" }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <StudentNavBar />

      <main className="flex-1 p-4 md:p-8 max-w-screen-xl mx-auto w-full">
        {/* Header Section */}
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiInfo className="text-blue-600 text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Evaluation Guidelines</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Learn how to provide meaningful and constructive feedback to help improve teaching quality and your learning experience.
          </p>
        </header>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-3">
              <FiClock className="text-blue-600 text-xl" />
              <h3 className="font-semibold text-gray-800">Evaluation Period</h3>
            </div>
            <p className="text-sm text-gray-600">
              Evaluations are typically open during the last 3 weeks of the semester. Check your dashboard for exact dates.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3 mb-3">
              <FiShield className="text-green-600 text-xl" />
              <h3 className="font-semibold text-gray-800">Confidential & Anonymous</h3>
            </div>
            <p className="text-sm text-gray-600">
              Your responses are completely anonymous. Instructors only see aggregated results.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center gap-3 mb-3">
              <FiBook className="text-purple-600 text-xl" />
              <h3 className="font-semibold text-gray-800">One Evaluation Per Course</h3>
            </div>
            <p className="text-sm text-gray-600">
              You can evaluate each instructor-subject combination once per semester. Choose carefully!
            </p>
          </div>
        </div>

        {/* Rating System Section */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiStar className="text-yellow-500" />
            Rating Scale Explained
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {ratingSystem.map((item) => (
              <div key={item.rating} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg mb-2 ${item.color}`}>
                  {item.rating}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{item.label}</h3>
                <p className="text-xs text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <FiInfo className="text-blue-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Tip:</strong> Use the entire rating scale thoughtfully. A rating of 3 ("Good") indicates satisfactory performance that meets expectations. Reserve higher ratings for exceptional performance and lower ratings for areas needing significant improvement.
              </span>
            </p>
          </div>
        </section>

        {/* Evaluation Criteria Section */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiUser className="text-blue-500" />
            Evaluation Criteria
          </h2>
          
          <p className="text-gray-600 mb-6">
            You will evaluate instructors based on five key criteria. Consider each criterion independently and provide ratings based on your actual classroom experiences throughout the semester.
          </p>

          <div className="space-y-6">
            {evaluationCriteria.map((criterion) => (
              <div key={criterion.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">{criterion.code}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">{criterion.title}</h3>
                    <p className="text-gray-600">{criterion.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Indicators */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FiCheckCircle className="text-green-500" />
                      What to Look For:
                    </h4>
                    <ul className="space-y-2">
                      {criterion.indicators.map((indicator, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-green-500 mt-1 flex-shrink-0">•</span>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rating Scale */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Rating Guidelines:</h4>
                    <div className="space-y-2">
                      {Object.entries(criterion.ratingScale).map(([rating, description]) => (
                        <div key={rating} className="flex justify-between items-start text-sm">
                          <span className="font-medium text-gray-800 w-24 flex-shrink-0">{rating}</span>
                          <span className="text-gray-600 flex-1">{description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Do's and Don'ts Section */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Best Practices</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Do's */}
            <div className="border border-green-200 rounded-lg p-6 bg-green-50">
              <div className="flex items-center gap-2 mb-4">
                <FiCheckCircle className="text-green-600 text-xl" />
                <h3 className="text-lg font-semibold text-green-800">Do's</h3>
              </div>
              <ul className="space-y-3">
                {doDontItems.do.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                    <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="border border-red-200 rounded-lg p-6 bg-red-50">
              <div className="flex items-center gap-2 mb-4">
                <FiXCircle className="text-red-600 text-xl" />
                <h3 className="text-lg font-semibold text-red-800">Don'ts</h3>
              </div>
              <ul className="space-y-3">
                {doDontItems.dont.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                    <FiXCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiAlertTriangle className="text-orange-500" />
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-start gap-2">
                  <span className="text-blue-600">Q:</span>
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-sm ml-6">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final Notes Section */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
            <FiInfo className="text-blue-600" />
            Important Notes
          </h2>
          
          <div className="space-y-3 text-blue-700">
            <p className="flex items-start gap-2">
              <span className="font-medium">• Your feedback matters:</span> Constructive evaluations help instructors improve their teaching methods and enhance the learning experience for future students.
            </p>
            <p className="flex items-start gap-2">
              <span className="font-medium">• Be specific and objective:</span> Focus on teaching behaviors and methods rather than personal characteristics.
            </p>
            <p className="flex items-start gap-2">
              <span className="font-medium">• Consider the big picture:</span> Evaluate based on the entire semester's experience, not just recent classes.
            </p>
            <p className="flex items-start gap-2">
              <span className="font-medium">• Technical support:</span> If you encounter any issues while submitting evaluations, contact the system administrator immediately.
            </p>
          </div>

          <div className="mt-6 p-4 bg-white rounded border border-blue-300">
            <p className="text-sm text-blue-800 text-center font-medium">
              Thank you for taking the time to provide valuable feedback. Your input contributes to maintaining high standards of teaching excellence at our institution.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-white text-center py-4 border-t border-gray-200 mt-8">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Faculty Profiling & Evaluation System (ProEv)
        </p>
      </footer>
    </div>
  );
}