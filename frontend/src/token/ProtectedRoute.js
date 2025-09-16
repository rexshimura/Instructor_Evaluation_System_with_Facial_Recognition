import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ requiredRole }) {
  const role = sessionStorage.getItem("role");
  const user = sessionStorage.getItem("user");

  // Debugging (optional)
  console.log("ProtectedRoute check:", { role, user, requiredRole });

  // 1. If no user OR no role → force login
  if (!user || !role || user === "null" || user === "undefined") {
    let loginPath = "/stud-login";
    if (requiredRole === "moderator") loginPath = "/modr-login";
    if (requiredRole === "admin") loginPath = "/admn-login";
    return <Navigate to={loginPath} replace />;
  }

  // 2. If role does not match required role → deny access
  if (role !== requiredRole) {
    return <Navigate to="/oops" replace />;
  }

  // 3. Valid session + correct role → allow
  return <Outlet />;
}
