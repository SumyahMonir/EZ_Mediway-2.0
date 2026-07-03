import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Wrap any route element that should require login.
 *
 * Usage in App.jsx:
 *
 *   <Route
 *     path="/patient/dashboard"
 *     element={
 *       <ProtectedRoute allowedRole="patient">
 *         <PatientDashboard />
 *       </ProtectedRoute>
 *     }
 *   />
 *
 * If allowedRole is omitted, the route just requires any valid login
 * (any role can access it).
 */
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in at all
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but wrong role for this specific route
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;