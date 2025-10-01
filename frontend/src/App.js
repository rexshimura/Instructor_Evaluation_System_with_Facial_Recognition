import React from "react";
 import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";

// LOGINS
import StudentLogin from "./pages/00-auth/StudentLogin";
import ModeratorLogin from "./pages/00-auth/ModeratorLogin";
import AdminLogin from "./pages/00-auth/AdminLogin";

// ADMIN ROUTES
import AdminPanel from "./pages/01-administration/admin_panel";
import AdminInstructorList from "./pages/01-administration/instructor_list/admin_instructor_list";
import AdminModeratorList from "./pages/01-administration/moderator_list/admin_moderator_list";

// MODERATOR ROUTES
import ModeratorPanel from "./pages/02-moderator/moderator_panel";
import RegisterForm from "./pages/02-moderator/register_instructor/register_form";
import FaceRecord from "./pages/02-moderator/register_instructor/register_face";
import InstructorList from "./pages/02-moderator/instructor_list/instructor_list";

// STUDENT ROUTES
import Home from "./pages/03-student/Home";
import StudentInstructorList from "./pages/03-student/Evaluate";
import EvaluationForm from "./pages/03-student/EvaluationForm";

// ERROR HANDLERS
import ProtectedRoute from "./token/ProtectedRoute";
import NotFound from "./pages/04-error/placeholder-notfound";
import LoginBlock from "./pages/04-error/placeholder-loginblock";

// INSTRUCTOR ROUTES
import InstructorProfile from "./pages/05-instructor/InstructorProfile";
import InstructorFaceRec from "./pages/05-instructor/InstructorFaceRec";


function App() {
  return (

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/stud-login" element={<StudentLogin />} />
        <Route path="/modr-login" element={<ModeratorLogin />} />
        <Route path="/admn-login" element={<AdminLogin />} />
        <Route path="/verify-instructor" element={<InstructorFaceRec />} />
        <Route path="/instructor-profile/:instructorID" element={<InstructorProfile />} />

        <Route element={<ProtectedRoute requiredRole="student" />}>
          <Route path="/home" element={<Home />} />
          <Route path="/instructor-list" element={<StudentInstructorList />} />
          <Route path="/instructor-evaluation/:instructorID/:subjectID" element={<EvaluationForm/>} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="moderator" />}>
          <Route path="/mod-panel" element={<ModeratorPanel />} />
          <Route path="/mod-register-instructor" element={<RegisterForm />} />
          <Route path="/mod-record-face" element={<FaceRecord />} />
          <Route path="/mod-record-face/:instructorID" element={<FaceRecord />} />

          <Route path="/mod-instructor-list" element={<InstructorList />} />
          <Route path="/mod-instructor-list/:instructorID" element={<InstructorList />} />
          <Route path="/mod-instructor-list/:instructorID/:subjectID" element={<InstructorList />} />
        </Route>

         <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/adm-panel" element={<AdminPanel />} />
        <Route path="/adm-instructor-list" element={<AdminInstructorList />} />
        <Route path="/adm-instructor-list/:instructorID" element={<AdminInstructorList />} />
        <Route path="/adm-instructor-list/:instructorID/:subjectID" element={<AdminInstructorList />} />

        <Route path="/adm-moderator-list" element={<AdminModeratorList />} />
        <Route path="/adm-moderator-list/:mod_ID" element={<AdminModeratorList />} />
        <Route path="/adm-moderator-list/:mod_ID/edit" element={<AdminModeratorList />} />
        </Route>

      <Route path="/oops" element={<LoginBlock />} />
      <Route path="*" element={<NotFound />} />
      </Routes>

  );
}

export default App;