const express = require("express");
const {
  getSubPitches,
  getReviews,
  getAvailableSlots,
} = require("../controllers/subPitchController");

const router = express.Router();

// UC-SUBPITCH-LIST-01: Các sân con của 1 venue
// GET /api/venues/:venueId/sub-pitches
router.get("/venues/:venueId/sub-pitches", getSubPitches);

// UC-REVIEW-LIST-01: Danh sách review của 1 sub-pitch
// GET /api/sub-pitches/:id/reviews
router.get("/sub-pitches/:id/reviews", getReviews);

// UC-AVAIL-SLOTS-01: Lưới khung giờ theo ngày
// GET /api/sub-pitches/:id/slots?date=YYYY-MM-DD
router.get("/sub-pitches/:id/slots", getAvailableSlots);

module.exports = router;
