const express = require("express");
const cors = require("cors");

const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const loanRoutes = require("./routes/loanRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/authRoutes");

// Test
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Backend is working 🚀" });
});

app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;