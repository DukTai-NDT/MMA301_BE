const express = require("express");
const UserController = require("../controllers/user.controller");
const isAuth = require("../middlewares/isAuth");
const router = express.Router();

router.put("/change-password", isAuth, UserController.changePassword);
router.put("/change-username", isAuth, UserController.changeUserName);

module.exports = router;
