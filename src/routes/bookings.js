const express = require("express");
const router = express.Router();
const {
  createBooking,
  confirmBooking,
} = require("../controllers/bookingsController");
const { checkAuth } = require("../middleware/auth");
const Booking = require("../models/Booking");

//  Tạo booking mới
router.post("/", createBooking);

//  Xác nhận thanh toán (VNPay → FE → BE)
router.post("/confirm/:holdId", confirmBooking);

// routes/bookings.js
router.get("/check-latest-booked", checkAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.sub })
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    return res.json({ bookedHolds: bookings });
  } catch (err) {
    console.error("check-latest-booked error:", err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
