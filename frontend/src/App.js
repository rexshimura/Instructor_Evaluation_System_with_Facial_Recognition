import React from "react";
 import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import StudentLogin from "./pages/StudentLogin";
import ModeratorLogin from "./pages/ModeratorLogin";
import AdminLogin from "./pages/AdminLogin";
import InstructorFaceRec from "./pages/05-instructor/InstructorFaceRec";

import Home from "./pages/03-student/Home";
import ModeratorPanel from "./pages/02-moderator/moderator_panel";
import ProtectedRoute from "./token/ProtectedRoute";
import RegisterForm from "./pages/02-moderator/register_instructor/register_form";
import FaceRecord from "./pages/02-moderator/register_instructor/register_face";
import InstructorList from "./pages/02-moderator/instructor_list/instructor_list";
import StudentInstructorList from "./pages/03-student/Evaluate";
import EvaluationForm from "./pages/03-student/EvaluationForm";
import InstructorProfile from "./pages/05-instructor/InstructorProfile";
import AdminPanel from "./pages/01-administration/admin_panel";
import NotFound from "./pages/04-error/placeholder-notfound";
import LoginBlock from "./pages/04-error/placeholder-loginblock";


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
          <Route path="/mod-instructor-list" element={<InstructorList />} />
        </Route>

         <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/adm-panel" element={<AdminPanel />} />
        </Route>

      <Route path="/oops" element={<LoginBlock />} />
      <Route path="*" element={<NotFound />} />
      </Routes>

  );
}

export default App;