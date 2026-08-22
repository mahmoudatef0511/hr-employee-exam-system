import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedTypes }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(user.type)) {
    const fallback =
      user.type === "hr" ? "/hr/dashboard" : "/employee/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
