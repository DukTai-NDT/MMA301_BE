const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const categoriesRoutes = require("./category.routes");
const roomsRoutes = require("./room.routes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoriesRoutes);
router.use("/rooms", roomsRoutes);

module.exports = router;
