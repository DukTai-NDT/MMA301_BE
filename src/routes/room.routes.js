const express = require("express");
const RoomController = require("../controllers/room.controller");
const isAuth = require("../middlewares/isAuth");
const router = express.Router();

//POST /rooms/
router.post("/", isAuth, RoomController.createRoom);

//PATCH /rooms/:roomId
router.patch("/:roomId", isAuth, RoomController.updateRoom);

module.exports = router;
