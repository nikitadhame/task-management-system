import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", members: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = () =>
    API.get("/projects").then((r) => setProjects(r.data)).catch(console.error).finally(() => setLoading(false));

  useEffect(() => {
    fetchProjects();
    if (isAdmin) API.get("/users").then((r) => setUsers(r.data)).catch(console.error);
  }, [isAdmin]);

  const openCreate = () => {
    setEditProject(null);
    setForm({ title: "", description: "", members: [] });
    setError("");
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({ title: p.title, description: p.description, members: p.members?.map((m) => m._id) || [] });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editProject) {
        const res = await API.put(`/projects/${editProject._id}`, form);
        setProjects((prev) => prev.map((p) => (p._id === editProject._id ? res.data : p)));
      } else {
        const res = await API.post("/projects", form);
        setProjects((prev) => [res.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save project.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and ALL its tasks? This cannot be undone.")) return;
    try {
      await API.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to delete project.");
    }
  };

  const toggleMember = (uid) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(uid) ? f.members.filter((id) => id !== uid) : [...f.members, uid],
    }));
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Projects" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1>Projects</h1>
              <p>{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
            </div>
            {isAdmin && (
              <button id="create-project-btn" className="btn btn-primary" onClick={openCreate}>
                + New Project
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div> Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <div className="empty-title">No projects yet</div>
              <div className="empty-desc">{isAdmin ? "Create your first project to get started." : "No projects have been created yet."}</div>
              {isAdmin && <button className="btn btn-primary" onClick={openCreate}>+ Create Project</button>}
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((p) => (
                <div key={p._id} className="project-card">
                  <div className="project-card-header">
                    <div>
                      <div className="project-title">{p.title}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        by {p.createdBy?.name || "—"} · {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(p)} title="Edit">✏️</button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(p._id)} title="Delete">🗑️</button>
                      </div>
                    )}
                  </div>

                  {p.description && <div className="project-desc">{p.description}</div>}

                  <div className="project-meta">
                    {p.members?.length > 0 ? (
                      <div className="project-member-avatars">
                        {p.members.slice(0, 5).map((m) => (
                          <div key={m._id} className="mini-avatar" title={m.name}>
                            {m.name?.[0]?.toUpperCase()}
                          </div>
                        ))}
                        {p.members.length > 5 && (
                          <div className="mini-avatar">+{p.members.length - 5}</div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No members assigned</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal
          title={editProject ? "Edit Project" : "Create New Project"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving..." : editProject ? "Save Changes" : "Create Project"}
              </button>
            </>
          }
        >
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Website Redesign"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Brief project description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {users.length > 0 && (
              <div className="form-group">
                <label className="form-label">Team Members</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto", padding: "4px 0" }}>
                  {users.map((u) => (
                    <label key={u._id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 12px", borderRadius: 8, background: form.members.includes(u._id) ? "var(--accent-glow)" : "var(--bg-card)", border: `1px solid ${form.members.includes(u._id) ? "rgba(99,102,241,0.3)" : "var(--border)"}`, transition: "all 0.15s" }}>
                      <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} style={{ accentColor: "var(--accent)" }} />
                      <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{u.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{u.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}
