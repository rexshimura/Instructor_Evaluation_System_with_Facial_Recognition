import React from "react";
 import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import ModeratorLogin from "./pages/ModeratorLogin";
import Home from "./pages/student/Home";
import ModeratorPanel from "./pages/moderator/moderator_panel";
import ProtectedRoute from "./token/ProtectedRoute";
import RegisterForm from "./pages/moderator/register_instructor/register_form";
import FaceRecord from "./pages/moderator/register_instructor/register_face";
import InstructorList from "./pages/moderator/instructor_list/instructor_list";
import StudentInstructorList from "./pages/student/Evaluate";

import NotFound from "./pages/error/placeholder-notfound";


function App() {
  return (

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mod" element={<ModeratorLogin />} />

        <Route element={<ProtectedRoute requiredRole="student" />}>
          <Route path="/home" element={<Home />} />
          <Route path="/instructor-list" element={<StudentInstructorList />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="moderator" />}>
          <Route path="/mod-panel" element={<ModeratorPanel />} />
          <Route path="/mod-register-instructor" element={<RegisterForm />} />
          <Route path="/mod-record-face" element={<FaceRecord />} />
          <Route path="/mod-instructor-list" element={<InstructorList />} />
        </Route>

      <Route path="*" element={<NotFound />} />
      </Routes>

  );
}

export default App;