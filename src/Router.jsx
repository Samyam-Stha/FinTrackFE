import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import App from "./App"; // your dashboard
import AuthForm from "@/components/auth/AuthForm.jsx";
import ProtectedRoute from "@/components/protectedRoute/ProtectedRoute";

export default function RouterComponent() {
  return (
    <Router>
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
