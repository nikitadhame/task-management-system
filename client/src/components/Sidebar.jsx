import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/tasks", label: "Tasks" },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>TeamTask</h2>
        <p>Project Management</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="nav-section-label" style={{ marginTop: 12 }}>Admin</div>
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              User Management
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          Logout
        </button>
      </div>
    </aside>
  );
}
