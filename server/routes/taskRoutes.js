const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

const router = express.Router();

// @POST /api/tasks — create task (Admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    if (!title || !project) {
      return res.status(400).json({ msg: "Title and project are required" });
    }

    const task = new Task({
      title,
      description,
      status: status || "Pending",
      priority: priority || "Medium",
      dueDate,
      project,
      assignedTo,
      createdBy: req.user.id,
    });

    await task.save();

    const populated = await task.populate([
      { path: "project", select: "title" },
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @GET /api/tasks — get all tasks
router.get("/", auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    if (req.query.status) filter.status = req.query.status;
    // Members only see their own assigned tasks
    if (req.user.role === "Member") filter.assignedTo = req.user.id;

    const tasks = await Task.find(filter)
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @GET /api/tasks/stats — dashboard stats
router.get("/stats", auth, async (req, res) => {
  try {
    const filter = req.user.role === "Member" ? { assignedTo: req.user.id } : {};

    const total = await Task.countDocuments(filter);
    const pending = await Task.countDocuments({ ...filter, status: "Pending" });
    const inProgress = await Task.countDocuments({ ...filter, status: "In Progress" });
    const completed = await Task.countDocuments({ ...filter, status: "Completed" });

    // Overdue = dueDate in the past and not completed
    const overdue = await Task.countDocuments({
      ...filter,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const totalProjects = await require("../models/Project").countDocuments();
    const totalUsers = await require("../models/User").countDocuments();

    res.json({ total, pending, inProgress, completed, overdue, totalProjects, totalUsers });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @GET /api/tasks/:id — get single task
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @PUT /api/tasks/:id — update task
// Admin: full update | Member: can only update status
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    // Members can only update status of tasks assigned to them
    if (req.user.role === "Member") {
      if (task.assignedTo?.toString() !== req.user.id) {
        return res.status(403).json({ msg: "You can only update tasks assigned to you" });
      }
      // Only allow status update
      task.status = req.body.status || task.status;
    } else {
      // Admin can update everything
      Object.assign(task, req.body);
    }

    await task.save();

    const populated = await task.populate([
      { path: "project", select: "title" },
      { path: "assignedTo", select: "name email" },
      { path: "createdBy", select: "name email" },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @DELETE /api/tasks/:id — delete task (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    await task.deleteOne();
    res.json({ msg: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;