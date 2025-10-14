# (ProEv) Instructor Evaluation System

## Overview

The **(ProEv) Instructor Evaluation System** is a digital platform designed to facilitate streamlined and secure instructor evaluations with integrated facial recognition technology. In this system, students provide feedback and ratings to evaluate instructors' teaching performance. Instructors use the facial recognition module to verify their identity and securely access their evaluation scores and performance feedback submitted by students.

This workflow ensures the integrity of the evaluation process and provides instructors with authenticated access to their evaluation results.

## Key Features

- **Student-Led Instructor Evaluation:** Students submit ratings and qualitative feedback on their instructors.
- **Instructor Facial Recognition Authentication:** Instructors verify their identity through facial recognition to access their evaluation reports.
- **Secure and Reliable Feedback Collection:** Prevents unauthorized access and ensures data accuracy.
- **Real-time Aggregation and Reporting:** Instructors can view up-to-date evaluation summaries.
- **User-friendly Interface:** Accessible for both students submitting evaluations and instructors viewing results.
- **Data Management:** Facilitates administration and report generation.

## Technologies Used

- Backend: Node.js (Express), PostgreSQL
- Frontend: JavaScript, Axios
- Facial Recognition: Integrated biometric verification module (e.g., Python-based or supported API)
- Development Tools: Nodemon for backend hot-reload, npm package manager

## Installation

After cloning the repository, follow the steps below to set up the system:

### Backend Setup
1. cd backend/server
2. npm install express cors pg nodemon
3. npx nodemon server.js

### Frontend Setup
1. cd frontend
2. npm install axios
3. npm start


This will launch the backend server and frontend application, allowing access to the instructor evaluation system via your browser.

## Usage

- **Students:** Submit evaluations by providing feedback on their instructors.
- **Instructors:** Authenticate with facial recognition to securely view their evaluation scores and feedback.
- **Moderators:** Assist instructors with registering their accounts and registering their facial data for authentication.
- **Admins:** Oversee the entire system operation, monitor overall instructor performance, and manage high-level reports and system settings.


## Contributing

Enhancements that improve system functionality, security, or user experience are welcome. Please fork the repository, make improvements, and submit a pull request.

## License

RavenLabs Dev.
