const RoomService = require("../services/room.service");

const listRoomOfCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const result = await RoomService.listRoomOfCategory(categoryId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
const createRoom = async (req, res, next) => {
  try {
    const data = req.body;
    const userId = req.user.id;

    const result = await RoomService.createRoom(userId, data);
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
};
const updateRoom = async (req, res, next) => {
  try {
    const data = req.body;
    const roomId = req.params.roomId;
    const userId = req.user.id;
    const result = await RoomService.updateRoom(userId, roomId, data);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  listRoomOfCategory,
  createRoom,
  updateRoom,
};
