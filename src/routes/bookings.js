const express = require("express");
const router = express.Router();
const { createBooking, confirmBooking } = require("../controllers/bookingsController");

//  Tạo booking mới
router.post("/", createBooking);

//  Xác nhận thanh toán (VNPay → FE → BE)
router.post("/confirm/:holdId", confirmBooking);

// routes/bookings.js
router.get("/check-latest-booked", async (req, res) => {
  const holds = await Hold.find({ userId: req.user._id, status: "booked" })
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  res.json({ bookedHolds: holds });
});

module.exports = router;
