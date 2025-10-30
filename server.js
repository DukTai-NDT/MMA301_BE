require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");

const app = express();
connectDB();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:3000,http://localhost:5173,http://localhost:4200"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(corsOptions));

// API routes
app.use("/api/auth", require("./src/routes/auth"));
// === THÊM 2 DÒNG NÀY VÀO ===
app.use("/api/owner", require("./src/routes/owner"));
app.use("/api/admin", require("./src/routes/admin"));
// ============================
// Simple health endpoint to test connectivity from phone browser
app.get("/", (req, res) => {
  res.json({ ok: true, service: "mma301_be", time: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
