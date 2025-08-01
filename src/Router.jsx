import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import App from "./App"; // your dashboard
import { AuthForm } from "@/components/auth/auth-form"
import ProtectedRoute from "@/components/protectedRoute/ProtectedRoute";

// Component to handle browser back button and authentication state
const AuthStateHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Clear auth data when user navigates away
      if (location.pathname === "/") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();
        localStorage.removeItem("dashboardCache");
      }
    };

    const handlePopState = () => {
      // Check if user is trying to go back to protected route without auth
      const token = localStorage.getItem("token");
      if (!token && location.pathname === "/home") {
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, location]);

  return null;
};

export default function RouterComponent() {
  return (
    <Router>
      <AuthStateHandler />
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
