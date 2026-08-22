import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const dashboardLink =
    user?.type === "hr" ? "/hr/dashboard" : "/employee/dashboard";

  return (
    <div className="navbar">
      <Link to={dashboardLink}>
        <strong>HR Exam System</strong>
      </Link>
      {user && (
        <div className="nav-links">
          <span>
            {user.name} ({user.type})
          </span>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      )}
    </div>
  );
}
