import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function StatusBadge({ status }) {
  const map = {
    Pending: "badge-pending",
    "In Progress": "badge-inprogress",
    Completed: "badge-completed",
  };
  return <span className={`badge ${map[status] || ""}`}>{status}</span>;
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get("/tasks/stats"), API.get("/tasks")])
      .then(([statsRes, tasksRes]) => {
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Dashboard" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h1>Overview</h1>
              <p>Your team's task summary</p>
            </div>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner" />
              Loading...
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats?.total ?? 0}</div>
                  <div className="stat-label">Total Tasks</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats?.pending ?? 0}</div>
                  <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats?.inProgress ?? 0}</div>
                  <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats?.completed ?? 0}</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats?.overdue ?? 0}</div>
                  <div className="stat-label">Overdue</div>
                </div>
                {isAdmin && (
                  <>
                    <div className="stat-card">
                      <div className="stat-value">{stats?.totalProjects ?? 0}</div>
                      <div className="stat-label">Projects</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                      <div className="stat-label">Users</div>
                    </div>
                  </>
                )}
              </div>

              <div className="section-title">Recent Tasks</div>
              {recentTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-title">No tasks yet</div>
                  <div className="empty-desc">Tasks assigned to you will appear here.</div>
                </div>
              ) : (
                <div className="recent-tasks">
                  {recentTasks.map((task) => {
                    const isOverdue =
                      task.dueDate &&
                      new Date(task.dueDate) < new Date() &&
                      task.status !== "Completed";
                    return (
                      <div key={task._id} className="recent-task-item">
                        <div className="recent-task-info">
                          <div className="recent-task-title">{task.title}</div>
                          <div className="recent-task-project">
                            {task.project?.title || "No project"}
                          </div>
                        </div>
                        <div className="recent-task-badges">
                          {isOverdue && (
                            <span className="badge badge-overdue">Overdue</span>
                          )}
                          <StatusBadge status={task.status} />
                          {task.dueDate && (
                            <span className={`task-due ${isOverdue ? "overdue" : ""}`}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
