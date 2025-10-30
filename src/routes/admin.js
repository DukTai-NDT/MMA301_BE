const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { checkAuth, checkRole } = require("../middleware/auth");

// Áp dụng middleware checkAuth và checkRole(['admin']) cho tất cả routes trong file này
router.use(checkAuth, checkRole(["admin"]));

// GET /api/admin/dashboard?from=&to=
router.get("/dashboard", adminController.getDashboard);

module.exports = router;