const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const College = require("./models/College");
const {
  sanitizeCollege,
  fetchAllColleges,
} = require("./services/recommendationService");
const recommendationRoutes = require("./routes/recommendationRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection logic
const primaryUri = process.env.MONGO_URI;
const localFallbackUri = "mongodb://127.0.0.1:27017/career_compass";

async function connectDatabase() {
  try {
    console.log("Connecting to primary MongoDB URI from .env...");
    await mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB Connected successfully to primary URI.");
  } catch (primaryErr) {
    console.warn(
      "Primary MongoDB connection failed (e.g. Atlas cluster paused or offline):",
      primaryErr.message,
    );
    try {
      console.log("Attempting local MongoDB connection (career_compass)...");
      await mongoose.connect(localFallbackUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log("MongoDB Connected to local career_compass database.");
    } catch (fallbackErr) {
      console.warn(
        "Local MongoDB connection also unavailable. Server will use factual data service:",
        fallbackErr.message,
      );
    }
  }
}

connectDatabase();

// Existing college list route (strictly omitting Highest Package)
app.get("/api/colleges", async (req, res) => {
  try {
    const colleges = await fetchAllColleges();
    const sanitized = colleges.map((c) => sanitizeCollege(c));
    res.json(sanitized);
  } catch (error) {
    console.error("Error in /api/colleges:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

// AI Recommendation and Chat routes
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/chat", aiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    databaseState:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Career Compass Server running on port ${PORT}`);
});
