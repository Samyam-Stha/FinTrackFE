import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../../utils/useAuth";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    // Additional check to ensure user is authenticated
    if (!isAuthenticated()) {
      // Clear any remaining auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      localStorage.removeItem("dashboardCache");

      // Force redirect to login
      navigate("/", { replace: true });
    }
  }, [navigate]);

  if (!user) {
    // Clear any remaining auth data when redirecting
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    localStorage.removeItem("dashboardCache");

    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
