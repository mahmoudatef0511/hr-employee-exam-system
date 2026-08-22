import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import HRDashboard from "../pages/HRDashboard";
import HRSubmissionDetails from "../pages/HRSubmissionDetails";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import ExamTaking from "../pages/ExamTaking";
import EmployeeSubmissionDetails from "../pages/EmployeeSubmissionDetails";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/hr/dashboard"
        element={
          <ProtectedRoute allowedTypes={["hr"]}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/submissions/:id"
        element={
          <ProtectedRoute allowedTypes={["hr"]}>
            <HRSubmissionDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedTypes={["employee"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/exams/:id"
        element={
          <ProtectedRoute allowedTypes={["employee"]}>
            <ExamTaking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/submissions/:id"
        element={
          <ProtectedRoute allowedTypes={["employee"]}>
            <EmployeeSubmissionDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <Navigate
            to={
              user
                ? user.type === "hr"
                  ? "/hr/dashboard"
                  : "/employee/dashboard"
                : "/login"
            }
            replace
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
