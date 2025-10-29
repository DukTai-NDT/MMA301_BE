const express = require("express");
const { listVenues, getVenue } = require("../controllers/venueController");

const router = express.Router();

router.get("/", listVenues);
router.get("/:venueId", getVenue);

module.exports = router;
