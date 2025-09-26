const instructorData = [
  // BSIT
  { in_instructorID: 1050001, in_fname: "Michael", in_mname: "J.", in_lname: "Smith", in_suffix: "Jr.", in_dob: "1980-05-15", in_sex: "M", in_email: "msmith@email.com", in_cnum: "0912-345-6789", in_dept: "BSIT", in_subhandled: ["101", "202", "305"] },
  { in_instructorID: 1050002, in_fname: "David", in_mname: "B.", in_lname: "Lee", in_suffix: "", in_dob: "1988-02-28", in_sex: "M", in_email: "dlee@email.com", in_cnum: "0934-567-8901", in_dept: "BSIT", in_subhandled: ["102", "201", "306"] },
  { in_instructorID: 1050003, in_fname: "Robert", in_mname: "D.", in_lname: "Perez", in_suffix: "", in_dob: "1979-07-10", in_sex: "M", in_email: "rperez@email.com", in_cnum: "0956-789-0123", in_dept: "BSIT", in_subhandled: ["103", "203", "401"] },
  { in_instructorID: 1050004, in_fname: "James", in_mname: "F.", in_lname: "Cruz", in_suffix: "", in_dob: "1972-12-01", in_sex: "M", in_email: "jcruz@email.com", in_cnum: "0978-901-2345", in_dept: "BSIT", in_subhandled: ["104", "204", "402"] },
  { in_instructorID: 1050005, in_fname: "Daniel", in_mname: "H.", in_lname: "Flores", in_suffix: "", in_dob: "1983-08-07", in_sex: "M", in_email: "dflores@email.com", in_cnum: "0901-234-5678", in_dept: "BSIT", in_subhandled: ["105", "205", "403"] },
  { in_instructorID: 1050006, in_fname: "Gwapo", in_mname: "X.", in_lname: "Lawas", in_suffix: "", in_dob: "1981-10-25", in_sex: "M", in_email: "pogilawas@email.com", in_cnum: "0921-123-4567", in_dept: "BSIT", in_subhandled: ["106", "206", "303"] },
  { in_instructorID: 1050007, in_fname: "Matthew", in_mname: "M.", in_lname: "Rodriguez", in_suffix: "", in_dob: "1976-05-08", in_sex: "M", in_email: "mrodriguez@email.com", in_cnum: "0943-345-6789", in_dept: "BSIT", in_subhandled: ["107", "207", "405"] },
  { in_instructorID: 1050008, in_fname: "Kevin", in_mname: "O.", in_lname: "Martinez", in_suffix: "", in_dob: "1987-09-02", in_sex: "M", in_email: "kmartinez@email.com", in_cnum: "0965-567-8901", in_dept: "BSIT", in_subhandled: ["108", "208", "406"] },
  { in_instructorID: 1050009, in_fname: "Brian", in_mname: "Q.", in_lname: "Johnson", in_suffix: "", in_dob: "1989-03-14", in_sex: "M", in_email: "bjohnson@email.com", in_cnum: "0987-789-0123", in_dept: "BSIT", in_subhandled: ["301"] },
  { in_instructorID: 1050010, in_fname: "Steven", in_mname: "S.", in_lname: "Moore", in_suffix: "", in_dob: "1970-12-31", in_sex: "M", in_email: "smoore@email.com", in_cnum: "0909-901-2345", in_dept: "BSIT", in_subhandled: ["302"] },
  { in_instructorID: 1050011, in_fname: "Mark", in_mname: "U.", in_lname: "Clark", in_suffix: "", in_dob: "1986-07-05", in_sex: "M", in_email: "mclark@email.com", in_cnum: "0921-123-4568", in_dept: "BSIT", in_subhandled: ["404"] },
  { in_instructorID: 1050012, in_fname: "Jason", in_mname: "W.", in_lname: "Green", in_suffix: "", in_dob: "1978-09-29", in_sex: "M", in_email: "jgreen@email.com", in_cnum: "0943-345-6790", in_dept: "BSIT", in_subhandled: ["304"] },
  { in_instructorID: 1050013, in_fname: "Gary", in_mname: "Y.", in_lname: "Baker", in_suffix: "", in_dob: "1971-11-21", in_sex: "M", in_email: "gbaker@email.com", in_cnum: "0965-567-8902", in_dept: "BSIT", in_subhandled: ["305"] },
  { in_instructorID: 1050014, in_fname: "Eric", in_mname: "A.", in_lname: "Carter", in_suffix: "", in_dob: "1985-03-10", in_sex: "M", in_email: "ecarter@email.com", in_cnum: "0987-789-0124", in_dept: "BSIT", in_subhandled: ["306"] },
  { in_instructorID: 1050015, in_fname: "Paul", in_mname: "C.", in_lname: "Hall", in_suffix: "", in_dob: "1992-06-23", in_sex: "M", in_email: "phall@email.com", in_cnum: "0909-901-2346", in_dept: "BSIT", in_subhandled: ["401"] },

  // BSIS (kept consistent for demo)
  { in_instructorID: 1060001, in_fname: "Jessica", in_mname: "A.", in_lname: "Jones", in_suffix: "", in_dob: "1975-11-20", in_sex: "F", in_email: "jjones@email.com", in_cnum: "0923-456-7890", in_dept: "BSIS", in_subhandled: ["111"] },
  { in_instructorID: 1060002, in_fname: "Sarah", in_mname: "C.", in_lname: "Chen", in_suffix: "", in_dob: "1991-09-03", in_sex: "F", in_email: "schen@email.com", in_cnum: "0945-678-9012", in_dept: "BSIS", in_subhandled: ["112"] },
  { in_instructorID: 1060003, in_fname: "Emily", in_mname: "E.", in_lname: "Gomez", in_suffix: "", in_dob: "1985-04-22", in_sex: "F", in_email: "egomez@email.com", in_cnum: "0967-890-1234", in_dept: "BSIS", in_subhandled: ["113"] },
  { in_instructorID: 1060004, in_fname: "Olivia", in_mname: "G.", in_lname: "Reyes", in_suffix: "", in_dob: "1990-06-18", in_sex: "F", in_email: "oreyes@email.com", in_cnum: "0989-012-3456", in_dept: "BSIS", in_subhandled: ["114"] },
  { in_instructorID: 1060005, in_fname: "Sophia", in_mname: "I.", in_lname: "Santos", in_suffix: "", in_dob: "1977-03-30", in_sex: "F", in_email: "ssantos@email.com", in_cnum: "0912-345-6780", in_dept: "BSIS", in_subhandled: ["115"] },
  { in_instructorID: 1060006, in_fname: "Amanda", in_mname: "L.", in_lname: "Garcia", in_suffix: "", in_dob: "1984-01-12", in_sex: "F", in_email: "agarcia@email.com", in_cnum: "0932-234-5678", in_dept: "BSIS", in_subhandled: ["121"] },
  { in_instructorID: 1060007, in_fname: "Laura", in_mname: "N.", in_lname: "Wilson", in_suffix: "", in_dob: "1993-11-17", in_sex: "F", in_email: "lwilson@email.com", in_cnum: "0954-456-7890", in_dept: "BSIS", in_subhandled: ["122"] },
  { in_instructorID: 1060008, in_fname: "Linda", in_mname: "P.", in_lname: "Hernandez", in_suffix: "", in_dob: "1974-06-25", in_sex: "F", in_email: "lhernandez@email.com", in_cnum: "0976-678-9012", in_dept: "BSIS", in_subhandled: ["123"] },
  { in_instructorID: 1060009, in_fname: "Nicole", in_mname: "R.", in_lname: "Patterson", in_suffix: "", in_dob: "1982-08-19", in_sex: "F", in_email: "npattersone@email.com", in_cnum: "0998-890-1234", in_dept: "BSIS", in_subhandled: ["111"] },
  { in_instructorID: 1060010, in_fname: "Rachel", in_mname: "T.", in_lname: "Taylor", in_suffix: "", in_dob: "1995-02-09", in_sex: "F", in_email: "rtaylor@email.com", in_cnum: "0910-012-3456", in_dept: "BSIS", in_subhandled: ["112"] },
  { in_instructorID: 1060011, in_fname: "Megan", in_mname: "V.", in_lname: "Hill", in_suffix: "", in_dob: "1994-04-11", in_sex: "F", in_email: "mhill@email.com", in_cnum: "0932-234-5679", in_dept: "BSIS", in_subhandled: ["113"] },
  { in_instructorID: 1060012, in_fname: "Hannah", in_mname: "X.", in_lname: "Adams", in_suffix: "", in_dob: "1983-02-06", in_sex: "F", in_email: "hadams@email.com", in_cnum: "0954-456-7891", in_dept: "BSIS", in_subhandled: ["114"] },
  { in_instructorID: 1060013, in_fname: "Rebecca", in_mname: "Z.", in_lname: "Nelson", in_suffix: "", in_dob: "1990-08-01", in_sex: "F", in_email: "rnelson@email.com", in_cnum: "0976-678-9013", in_dept: "BSIS", in_subhandled: ["115"] },
  { in_instructorID: 1060014, in_fname: "Chloe", in_mname: "B.", in_lname: "Fisher", in_suffix: "", in_dob: "1979-05-18", in_sex: "F", in_email: "cfisher@email.com", in_cnum: "0998-890-1235", in_dept: "BSIS", in_subhandled: ["121"] },
  { in_instructorID: 1060015, in_fname: "Samantha", in_mname: "D.", in_lname: "King", in_suffix: "", in_dob: "1988-12-04", in_sex: "F", in_email: "sking@email.com", in_cnum: "0910-012-3457", in_dept: "BSIS", in_subhandled: ["122"] },
];
// in_instructorID: Instructor ID
// in_fname: First Name
// in_mname: Middle Name
// in_lname: Last Name
// in_suffix: Suffix (e.g., Jr., Sr.)
// in_dob: Date of Birth
// in_sex: Sex (M or F)
// in_email: Email Address
// in_cnum: Contact Number
// in_dept: Department

export default instructorData;