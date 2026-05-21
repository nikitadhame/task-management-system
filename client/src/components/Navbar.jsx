import { useAuth } from "../context/AuthContext";

export default function Navbar({ title }) {
  const { user } = useAuth();
  return (
    <header className="navbar">
      <div className="navbar-title">{title}</div>
      <div className="navbar-user">
        {user?.name} &mdash; {user?.role}
      </div>
    </header>
  );
}
