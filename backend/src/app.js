const express = require("express");
const cors = require("cors");

const profileRoutes = require("./routes/profile.routes");
const dilemmaRoutes = require("./routes/dilemma.routes");
const chatRoutes = require("./routes/chat.routes");
const assessmentRoutes = require("./routes/assessment.routes");
const careerRoutes = require("./routes/career.routes");
const roadmapRoutes = require("./routes/roadmap.routes");

const {
    notFound,
    errorHandler,
} = require("./middleware/error.middleware");

const app = express();

// Global middleware
app.use(cors());
app.use(express.json({ limit: "100kb" }));

// Root endpoint
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "PATHFINDER Backend is running!",
    });
});

// Health-check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        service: "PATHFINDER Backend",
    });
});

// API routes
app.use("/api/profile", profileRoutes);
app.use("/api/dilemma", dilemmaRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/career/roadmap", roadmapRoutes);
app.use("/api/career", careerRoutes);

// Handle unknown routes and errors
app.use(notFound);
app.use(errorHandler);

module.exports = app;
