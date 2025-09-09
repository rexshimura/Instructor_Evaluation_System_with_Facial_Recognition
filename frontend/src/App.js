import React from "react";
 import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import ModeratorLogin from "./pages/ModeratorLogin";
import Home from "./pages/home/Home";
import ModeratorPanel from "./pages/moderator_panel/moderator_panel";
import ProtectedRoute from "./token/ProtectedRoute";
import NotFound from "./pages/error/placeholder-notfound";

function App() {
  return (

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mod" element={<ModeratorLogin />} />

        <Route element={<ProtectedRoute requiredRole="student" />}>
          <Route path="/home" element={<Home />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="moderator" />}>
          <Route path="/mod-panel" element={<ModeratorPanel />} />
        </Route>

      <Route path="*" element={<NotFound />} />
      </Routes>

  );
}

export default App;