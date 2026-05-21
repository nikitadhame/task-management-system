const express = require("express");
const Project = require("../models/Project");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

const router = express.Router();

// @POST /api/projects — create project (Admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    const { title, description, members } = req.body;
    if (!title) return res.status(400).json({ msg: "Project title is required" });

    const project = new Project({
      title,
      description,
      createdBy: req.user.id,
      members: members || [],
    });

    await project.save();

    const populated = await project.populate([
      { path: "createdBy", select: "name email" },
      { path: "members", select: "name email" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @GET /api/projects — get all projects
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @GET /api/projects/:id — get single project
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!project) return res.status(404).json({ msg: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @PUT /api/projects/:id — update project (Admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("members", "name email");

    if (!project) return res.status(404).json({ msg: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// @DELETE /api/projects/:id — delete project and its tasks (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    // Delete all tasks under this project
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ msg: "Project and all its tasks deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;