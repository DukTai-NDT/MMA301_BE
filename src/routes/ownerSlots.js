const express = require("express");
const router = express.Router();
const { getOwnerSlots } = require("../controllers/ownerSlotController");
const { authenticate, checkRole } = require("../middleware/auth");

// Owner view: only owner (or admin) can access slots for their sub-pitch
router.get(
  "/owner/sub-pitches/:id/slots",
  authenticate,
  checkRole("owner"),
  getOwnerSlots
);

module.exports = router;
