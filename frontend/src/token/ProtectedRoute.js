import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const user = sessionStorage.getItem("user");

  // Check if a user is authenticated
  if (!user) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the child routes (e.g., Home)
  return <Outlet />;
}