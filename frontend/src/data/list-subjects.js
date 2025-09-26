const subjectLoad = [
  // Year 1 (BSIT)
  { sb_subID: "101", sb_name: "Introduction to Computing", sb_miscode: "IT101", sb_semester: 1, sb_year: 1, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "102", sb_name: "Computer Programming 1", sb_miscode: "IT102", sb_semester: 1, sb_year: 1, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "103", sb_name: "Mathematics in the Modern World", sb_miscode: "GE103", sb_semester: 1, sb_year: 1, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "104", sb_name: "Reading and Writing", sb_miscode: "GE104", sb_semester: 1, sb_year: 1, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "105", sb_name: "Physical Education 1", sb_miscode: "PE105", sb_semester: 1, sb_year: 1, sb_units: 2, sb_course: "BSIT" },
  { sb_subID: "106", sb_name: "Purposive Communication", sb_miscode: "GE106", sb_semester: 2, sb_year: 1, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "107", sb_name: "Computer Programming 2", sb_miscode: "IT107", sb_semester: 2, sb_year: 1, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "108", sb_name: "Physical Education 2", sb_miscode: "PE108", sb_semester: 2, sb_year: 1, sb_units: 2, sb_course: "BSIT" },

  // Year 2 (BSIT)
  { sb_subID: "201", sb_name: "Data Structures and Algorithms", sb_miscode: "IT201", sb_semester: 1, sb_year: 2, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "202", sb_name: "Information Management", sb_miscode: "IT202", sb_semester: 1, sb_year: 2, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "203", sb_name: "Professional Elective 1", sb_miscode: "IT203", sb_semester: 1, sb_year: 2, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "204", sb_name: "Object-Oriented Programming", sb_miscode: "IT204", sb_semester: 1, sb_year: 2, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "205", sb_name: "Networking 1", sb_miscode: "IT205", sb_semester: 2, sb_year: 2, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "206", sb_name: "The Contemporary World", sb_miscode: "GE206", sb_semester: 2, sb_year: 2, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "207", sb_name: "Science, Technology, and Society", sb_miscode: "GE207", sb_semester: 2, sb_year: 2, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "208", sb_name: "Physical Education 3", sb_miscode: "PE208", sb_semester: 2, sb_year: 2, sb_units: 2, sb_course: "BSIT" },

  // Year 3 (BSIT)
  { sb_subID: "301", sb_name: "Integrative Programming and Technologies", sb_miscode: "IT301", sb_semester: 1, sb_year: 3, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "302", sb_name: "Information Assurance and Security", sb_miscode: "IT302", sb_semester: 1, sb_year: 3, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "303", sb_name: "Human-Computer Interaction", sb_miscode: "IT304", sb_semester: 1, sb_year: 3, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "304", sb_name: "The Life and Works of Rizal", sb_miscode: "GE304", sb_semester: 1, sb_year: 3, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "305", sb_name: "Systems Analysis and Design", sb_miscode: "IT305", sb_semester: 2, sb_year: 3, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "306", sb_name: "Application Development and Emerging Technologies", sb_miscode: "IT306", sb_semester: 2, sb_year: 3, sb_course: "BSIT" },
  { sb_subID: "307", sb_name: "IT Elective 1", sb_miscode: "IT307", sb_semester: 2, sb_year: 3, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "308", sb_name: "Physical Education 4", sb_miscode: "PE308", sb_semester: 2, sb_year: 3, sb_units: 2, sb_course: "BSIT" },

  // Year 4 (BSIT)
  { sb_subID: "401", sb_name: "Systems Integration and Architecture", sb_miscode: "IT401", sb_semester: 1, sb_year: 4, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "402", sb_name: "System Administration and Maintenance", sb_miscode: "IT402", sb_semester: 1, sb_year: 4, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "403", sb_name: "Capstone Project 1", sb_miscode: "IT403", sb_semester: 1, sb_year: 4, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "404", sb_name: "On-the-Job Training", sb_miscode: "IT404", sb_semester: 2, sb_year: 4, sb_units: 6, sb_course: "BSIT" },
  { sb_subID: "405", sb_name: "Capstone Project 2", sb_miscode: "IT405", sb_semester: 2, sb_year: 4, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "406", sb_name: "IT Elective 2", sb_miscode: "IT406", sb_semester: 2, sb_year: 4, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "407", sb_name: "IT Elective 3", sb_miscode: "IT407", sb_semester: 2, sb_year: 4, sb_units: 3, sb_course: "BSIT" },
  { sb_subID: "408", sb_name: "IT Elective 4", sb_miscode: "IT408", sb_semester: 2, sb_year: 4, sb_units: 3, sb_course: "BSIT" },

  // ==========================================================

  // Year 1 (BSIS)
  { sb_subID: "111", sb_name: "Fundamentals of Information Systems", sb_miscode: "IS111", sb_semester: 1, sb_year: 1, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "112", sb_name: "Computer Programming 1", sb_miscode: "IS112", sb_semester: 1, sb_year: 1, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "113", sb_name: "Organization and Management Concepts", sb_miscode: "IS113", sb_semester: 1, sb_year: 1, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "114", sb_name: "Business Process Management", sb_miscode: "IS114", sb_semester: 1, sb_year: 1, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "115", sb_name: "Physical Education 1", sb_miscode: "PE115", sb_semester: 1, sb_year: 1, sb_units: 2, sb_course: "BSIS" },
  { sb_subID: "121", sb_name: "Introduction to Accounting and Financial Management", sb_miscode: "IS121", sb_semester: 2, sb_year: 1, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "122", sb_name: "Computer Programming 2", sb_miscode: "IS122", sb_semester: 2, sb_year: 1, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "123", sb_name: "Discrete Mathematics", sb_miscode: "IS123", sb_semester: 2, sb_year: 1, sb_units: 3, sb_course: "BSIS" },

  // Year 2 (BSIS)
  { sb_subID: "211", sb_name: "Systems Analysis and Design", sb_miscode: "IS211", sb_semester: 1, sb_year: 2, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "212", sb_name: "Database Management Systems", sb_miscode: "IS212", sb_semester: 1, sb_year: 2, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "213", sb_name: "Object-Oriented Programming", sb_miscode: "IS213", sb_semester: 1, sb_year: 2, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "214", sb_name: "IT Infrastructure and Networking Technologies", sb_miscode: "IS214", sb_semester: 1, sb_year: 2, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "215", sb_name: "Physical Education 2", sb_miscode: "PE215", sb_semester: 1, sb_year: 2, sb_units: 2, sb_course: "BSIS" },
  { sb_subID: "221", sb_name: "Web Application Development", sb_miscode: "IS221", sb_semester: 2, sb_year: 2, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "222", sb_name: "Quantitative Methods for Information Systems", sb_miscode: "IS222", sb_semester: 2, sb_year: 2, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "223", sb_name: "Project Management for Information Systems", sb_miscode: "IS223", sb_semester: 2, sb_year: 2, sb_units: 3, sb_course: "BSIS" },

  // Year 3 (BSIS)
  { sb_subID: "311", sb_name: "Information Security and Risk Management", sb_miscode: "IS311", sb_semester: 1, sb_year: 3, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "312", sb_name: "Evaluation of Business Performance", sb_miscode: "IS312", sb_semester: 1, sb_year: 3, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "313", sb_name: "Business Intelligence and Data Analytics", sb_miscode: "IS313", sb_semester: 1, sb_year: 3, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "314", sb_name: "Physical Education 3", sb_miscode: "PE314", sb_semester: 1, sb_year: 3, sb_units: 2, sb_course: "BSIS" },
  { sb_subID: "321", sb_name: "Technopreneurship", sb_miscode: "IS321", sb_semester: 2, sb_year: 3, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "322", sb_name: "Enterprise Architecture", sb_miscode: "IS322", sb_semester: 2, sb_year: 3, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "323", sb_name: "IS Elective 1", sb_miscode: "IS323", sb_semester: 2, sb_year: 3, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "324", sb_name: "Research Methods for Information Systems", sb_miscode: "IS324", sb_semester: 2, sb_year: 3, sb_units: 3, sb_course: "BSIS" },

  // Year 4 (BSIS)
  { sb_subID: "411", sb_name: "Strategic IT Management", sb_miscode: "IS411", sb_semester: 1, sb_year: 4, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "412", sb_name: "Capstone Project 1", sb_miscode: "IS412", sb_semester: 1, sb_year: 4, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "413", sb_name: "IT Audit and Assurance", sb_miscode: "IS413", sb_semester: 1, sb_year: 4, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "414", sb_name: "IS Elective 2", sb_miscode: "IS414", sb_semester: 1, sb_year: 4, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "415", sb_name: "Physical Education 4", sb_miscode: "PE415", sb_semester: 1, sb_year: 4, sb_units: 2, sb_course: "BSIS" },
  { sb_subID: "421", sb_name: "On-the-Job Training", sb_miscode: "IS421", sb_semester: 2, sb_year: 4, sb_units: 6, sb_course: "BSIS" },
  { sb_subID: "422", sb_name: "Capstone Project 2", sb_miscode: "IS422", sb_semester: 2, sb_year: 4, sb_units: 3, sb_course: "BSIS" },
  { sb_subID: "423", sb_name: "IS Elective 3", sb_miscode: "IS423", sb_semester: 2, sb_year: 4, sb_units: 3, sb_course: "BSIS" }
];

export default subjectLoad;