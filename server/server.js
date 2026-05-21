const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// CORS — allow React dev server and production
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date() }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI && process.env.NODE_ENV === "production") {
  console.error("❌ MONGO_URI environment variable is not set!");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI || "mongodb://127.0.0.1:27017/teamtaskmanager")
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });