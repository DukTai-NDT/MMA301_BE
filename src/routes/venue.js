// src/routes/venueRoutes.js
const express = require('express');
const router = express.Router();

// --- Import Venue Controller (Đã có) ---
const {
  getMyVenues,
  createVenue,
  updateVenue,
  updateVenueStatus,
} = require('../controllers/venueController.js');

// --- Import SubPitch Controller (MỚI) ---
const {
  getSubPitchesByVenue,
  createSubPitch,
} = require('../controllers/subPitchController.js');

// Import middleware (Đã có)
const { protect, isOwner } = require('../middleware/authMiddleware.js');

// Áp dụng middleware (Đã có)
router.use(protect, isOwner);

// === CÁC ROUTE VENUE (ĐÃ CÓ) ===
router.route('/')
  .get(getMyVenues)
  .post(createVenue);

router.route('/:id')
  .put(updateVenue);

router.route('/:id/status')
  .patch(updateVenueStatus);

// =============================================
// === CÁC ROUTE SUB-PITCH LỒNG NHAU (MỚI) ===
// =============================================

// GET /owner/venues/:venueId/sub-pitches
// POST /owner/venues/:venueId/sub-pitches
router.route('/:venueId/sub-pitches')
  .get(getSubPitchesByVenue)
  .post(createSubPitch);

module.exports = router;