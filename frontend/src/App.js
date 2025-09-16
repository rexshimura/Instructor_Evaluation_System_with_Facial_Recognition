import React from "react";
import { Routes, Route } from "react-router-dom";

import StudentLogin from "./pages/StudentLogin";
import ModeratorLogin from "./pages/ModeratorLogin";
import AdminLogin from "./pages/AdminLogin";

import Home from "./pages/03-student/Home";
import ModeratorPanel from "./pages/02-moderator/moderator_panel";
import ProtectedRoute from "./token/ProtectedRoute";
import RegisterForm from "./pages/02-moderator/register_instructor/register_form";
import FaceRecord from "./pages/02-moderator/register_instructor/register_face";
import InstructorList from "./pages/02-moderator/instructor_list/instructor_list";
import StudentInstructorList from "./pages/03-student/Evaluate";
import EvaluationForm from "./pages/03-student/EvaluationForm";
import AdminPanel from "./pages/01-administration/admin_panel";
import NotFound from "./pages/04-error/placeholder-notfound";
import LoginBlock from "./pages/04-error/placeholder-loginblock";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<StudentLogin />} />
      <Route path="/mod" element={<ModeratorLogin />} />
      <Route path="/adm" element={<AdminLogin />} />

      {/* Student Routes */}
      <Route element={<ProtectedRoute requiredRole="student" />}>
        <Route path="/home" element={<Home />} />
        <Route path="/instructor-list" element={<StudentInstructorList />} />
        <Route
          path="/instructor-evaluation/:instructorID/:subjectID"
          element={<EvaluationForm />}
        />
      </Route>

      {/* Moderator Routes */}
      <Route element={<ProtectedRoute requiredRole="moderator" />}>
        <Route path="/mod-panel" element={<ModeratorPanel />} />
        <Route path="/mod-register-instructor" element={<RegisterForm />} />
        <Route path="/mod-record-face" element={<FaceRecord />} />
        <Route path="/mod-instructor-list" element={<InstructorList />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/adm-panel" element={<AdminPanel />} />
      </Route>

      {/* Error / Fallback */}
      <Route path="/oops" element={<LoginBlock />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
