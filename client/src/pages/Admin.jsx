import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    API.get("/users")
      .then((r) => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const res = await API.put(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update role.");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await API.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to delete user.");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Admin" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1>User Management</h1>
              <p>{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner" />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-title">No users found</div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u._id === currentUser?._id;
                    return (
                      <tr key={u._id}>
                        <td>
                          <div className="user-row">
                            <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="td-name">
                              {u.name}
                              {isSelf && <span className="you-tag" style={{ marginLeft: 6 }}>you</span>}
                            </span>
                          </div>
                        </td>
                        <td className="td-email">{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === "Admin" ? "badge-admin" : "badge-member"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ color: "var(--color-text-secondary)" }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="td-actions">
                            {!isSelf ? (
                              <>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() =>
                                    handleRoleChange(u._id, u.role === "Admin" ? "Member" : "Admin")
                                  }
                                  disabled={updating === u._id}
                                >
                                  {updating === u._id
                                    ? "Saving..."
                                    : u.role === "Admin"
                                    ? "Make Member"
                                    : "Make Admin"}
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDelete(u._id)}
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
