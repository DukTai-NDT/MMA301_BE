const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/adminUserController");
const venueCtrl = require("../controllers/adminVenueController");
const bookingCtrl = require("../controllers/adminBookingController");

// --- USERS ---
router.get("/users", userCtrl.listUsers);
router.patch("/users/:id/status", userCtrl.updateStatus);
router.patch("/users/:id/roles", userCtrl.updateRole);

// --- VENUES ---
router.get("/venues", venueCtrl.listVenues);
router.patch("/venues/:id/status", venueCtrl.updateStatus);
router.patch("/venues/:id/approve", venueCtrl.approveVenue);

// --- BOOKINGS ---
router.get("/bookings", bookingCtrl.listBookings);

module.exports = router;
