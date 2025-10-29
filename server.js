const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

dotenv.config(); // ✅ Load biến môi trường từ .env

const app = express();

// Middleware
app.use(express.json());

// Kết nối MongoDB
connectDB();

// Route mặc định (test server)
app.get("/", (req, res) => {
  res.send({ message: "Welcome to Football Booking App!" });
});

// ====== ROUTES ======
app.use("/api/auth", require("./src/routes/auth")); // nếu có route auth
app.use("/api/venues", require("./src/routes/venues"));
app.use("/api", require("./src/routes/subPitches"));
app.use("/api/holds", require("./src/routes/holds"));
// =====================

// PORT
const PORT = process.env.PORT || 9999;

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
