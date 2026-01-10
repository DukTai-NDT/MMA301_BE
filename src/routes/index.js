const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const categoriesRoutes = require("./category.routes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoriesRoutes);

module.exports = router;
