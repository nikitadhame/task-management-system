import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["Pending", "In Progress", "Completed"];
const PRIORITIES = ["Low", "Medium", "High"];

function priorityBadge(p) {
  const map = { Low: "badge-low", Medium: "badge-medium", High: "badge-high" };
  const icons = { Low: "🟢", Medium: "🟡", High: "🔴" };
  return <span className={`badge ${map[p]}`}>{icons[p]} {p}</span>;
}

function KanbanCol({ status, tasks, onEdit, onDelete, onStatusChange, isAdmin }) {
  const colClass = status === "Pending" ? "pending" : status === "In Progress" ? "inprogress" : "completed";
  const icon = status === "Pending" ? "⏳" : status === "In Progress" ? "🔄" : "✅";
  return (
    <div className={`kanban-col ${colClass}`}>
      <div className="kanban-col-header">
        <div className="kanban-col-title">{icon} {status}</div>
        <span className="kanban-col-count">{tasks.length}</span>
      </div>
      <div className="kanban-tasks">
        {tasks.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "20px 0" }}>No tasks</div>
        )}
        {tasks.map((task) => {
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed";
          return (
            <div key={task._id} className="task-card">
              <div className="task-card-title">{task.title}</div>
              {task.description && <div className="task-card-desc">{task.description}</div>}
              <div className="task-card-meta">
                {priorityBadge(task.priority || "Medium")}
                {isOverdue && <span className="badge badge-overdue">🔥 Overdue</span>}
              </div>
              <div className="task-card-footer">
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {task.assignedTo && (
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                      <div className="user-avatar" style={{ width: 18, height: 18, fontSize: 9 }}>{task.assignedTo.name?.[0]}</div>
                      {task.assignedTo.name}
                    </div>
                  )}
                  {task.dueDate && (
                    <span className={`due-date ${isOverdue ? "overdue" : ""}`}>
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {!isAdmin && task.status !== "Completed" && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => onStatusChange(task._id, status === "Pending" ? "In Progress" : "Completed")}
                      title="Move forward"
                    >▶</button>
                  )}
                  {isAdmin && (
                    <>
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => onEdit(task)} title="Edit">✏️</button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => onDelete(task._id)} title="Delete">🗑️</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Tasks() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filterProject, setFilterProject] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", status: "Pending",
    priority: "Medium", dueDate: "", project: "", assignedTo: "",
  });

  const fetchTasks = () =>
    API.get("/tasks").then((r) => setTasks(r.data)).catch(console.error);

  useEffect(() => {
    Promise.all([
      API.get("/tasks"),
      API.get("/projects"),
      isAdmin ? API.get("/users") : Promise.resolve({ data: [] }),
    ]).then(([t, p, u]) => {
      setTasks(t.data);
      setProjects(p.data);
      setUsers(u.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [isAdmin]);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: "", description: "", status: "Pending", priority: "Medium", dueDate: "", project: projects[0]?._id || "", assignedTo: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority || "Medium",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      project: task.project?._id || "",
      assignedTo: task.assignedTo?._id || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      if (editTask) {
        const res = await API.put(`/tasks/${editTask._id}`, payload);
        setTasks((prev) => prev.map((t) => (t._id === editTask._id ? res.data : t)));
      } else {
        const res = await API.post("/tasks", payload);
        setTasks((prev) => [res.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) { alert(err.response?.data?.msg || "Failed to delete."); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await API.put(`/tasks/${id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) { alert(err.response?.data?.msg || "Failed to update status."); }
  };

  const filtered = tasks.filter((t) => {
    if (filterProject && t.project?._id !== filterProject) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const byStatus = (s) => filtered.filter((t) => t.status === s);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Tasks" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1>Task Board</h1>
              <p>{tasks.length} total task{tasks.length !== 1 ? "s" : ""}</p>
            </div>
            {isAdmin && <button id="create-task-btn" className="btn btn-primary" onClick={openCreate}>+ New Task</button>}
          </div>

          <div className="filter-bar">
            <select className="form-select" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
              <option value="">All Projects</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
            <select className="form-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-secondary)" }}>
              Showing {filtered.length} task{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div> Loading tasks...</div>
          ) : (
            <div className="kanban-board">
              {STATUSES.map((s) => (
                <KanbanCol
                  key={s} status={s}
                  tasks={byStatus(s)}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal
          title={editTask ? "Edit Task" : "Create New Task"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving..." : editTask ? "Save Changes" : "Create Task"}
              </button>
            </>
          }
        >
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input type="text" className="form-input" placeholder="e.g. Design landing page" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Task details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select className="form-select" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} required>
                  <option value="">Select Project</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-select" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
