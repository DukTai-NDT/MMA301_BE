require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");

const app = express();

// =======================
// 🧩 Middleware
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// 🌐 CORS Setup
// =======================
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

// =======================
// 🗄️ Kết nối MongoDB
// =======================
connectDB();

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "football_booking_app",
    time: new Date().toISOString(),
  });
});

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/venues", require("./src/routes/venues"));
app.use("/api", require("./src/routes/subPitches"));
app.use("/api/holds", require("./src/routes/holds"));
app.use("/api", require("./src/routes/ownerSlots"));
app.use("/api/owner", require("./src/routes/owner"));
app.use("/api/admin", require("./src/routes/admin"));
app.use("/api/reviews", require("./src/routes/review"));

// =======================
// ⚠️ Error Handler
// =======================
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// =======================
// 🔥 Start Server
// =======================
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
