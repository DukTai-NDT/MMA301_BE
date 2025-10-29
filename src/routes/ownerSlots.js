const express = require("express");
const router = express.Router();
const { getOwnerSlots } = require("../controllers/ownerSlotController");

router.get("/owner/sub-pitches/:id/slots", getOwnerSlots);

module.exports = router;
