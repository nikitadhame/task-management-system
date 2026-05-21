import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "Admin") return <Navigate to="/" replace />;

  return children;
}
