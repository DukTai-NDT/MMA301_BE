const { User, Room, Category, RoomParticipant } = require("../models");
const { Op } = require("sequelize");

const httpError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
const listRoomOfCategory = async (categoryId) => {
  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw httpError("Category not found", 404);
  }
  const rooms = await Room.findAll({
    where: { category_id: categoryId },
    include: [
      {
        model: User,
        as: "owner",
      },
    ],
  });
  const result = rooms.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    owner_name: r.owner.username,
  }));
  return result;
};
const createRoom = async (userId, data) => {
  const { name, description, categoryId } = data;

  if (!name || name.trim() === "") {
    throw httpError("Room name is required", 400);
  }

  const user = await User.findByPk(userId);
  if (!user) throw httpError("User not found", 404);

  const category = await Category.findByPk(categoryId);
  if (!category) throw httpError("Category not found", 404);

  const room = await Room.create({
    name,
    description,
    category_id: categoryId,
    owner_id: userId,
  });

  const newRoomParticipant = await RoomParticipant.create({
    user_id: userId,
    room_id: room.id,
    joined_at: new Date(),
  });

  return room;
};
const updateRoom = async (userId, roomId, data) => {
  const { name, description } = data;

  const room = await Room.findByPk(roomId);
  if (!room) throw httpError("Room not found", 404);
  const user = await User.findByPk(userId);
  if (room.owner_id !== userId && user.role !== "admin") {
    throw httpError("Only owner or admin can update this room", 403);
  }

  //   if (!name || name.trim() === "") {
  //     throw httpError("Room name is required", 400);
  //   }
  //   if (!description || description.trim() === "") {
  //     throw httpError("Description is required", 400);
  //   }

  if (name !== undefined) room.name = name;
  if (description !== undefined) room.description = description;

  await room.save();
  return room;
};
module.exports = { listRoomOfCategory, createRoom, updateRoom };
