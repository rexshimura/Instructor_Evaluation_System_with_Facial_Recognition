import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ requiredRole }) {
  const role = sessionStorage.getItem("role");
  const user = sessionStorage.getItem("user");

  // 1. Check if the user is authenticated at all.
  // If not, redirect them to the correct login page.
  if (!user || !role) {
    const loginPath = requiredRole === 'student' ? '/' : '/mod';
    return <Navigate to={loginPath} replace />;
  }

  // 2. Check if the authenticated user has the correct role for this route.
  // If their role doesn't match the required role, redirect them to their own dashboard.
  if (role !== requiredRole) {
    const dashboardPath = role === 'student' ? '/home' : '/mod-panel';
    return <Navigate to={dashboardPath} replace />;
  }

  // 3. If the user is authenticated AND has the correct role,
  // allow them to access the requested page.
  return <Outlet />;
}