//

// routes/owner.js
const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");
const ownerBookingController = require("../controllers/ownerBookingController");
const { protect, isOwner } = require("../middleware/authMiddleware");

// ✅ CHỈ DÙNG middleware này thôi
router.use(protect, isOwner);

// GET /api/owner/dashboard?from=&to=
router.get("/dashboard", ownerController.getDashboard);
router.get("/bookings", ownerBookingController.listOwnerBookings);

module.exports = router;
