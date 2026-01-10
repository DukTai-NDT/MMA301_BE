const { sequelize } = require("../config/database");
const modelDefiners = [
  require("./user.model"),
  require("./category.model"),
  require("./room.model"),
  require("./room_participant.model"),
  require("./message.model"),
];

modelDefiners.forEach((defineModel) => defineModel(sequelize));
const { User, Category, Room, RoomParticipant, Message } = sequelize.models;
const applyAssociations = () => {
  Category.hasMany(Room, {
    foreignKey: "category_id",
    as: "rooms",
  });

  Room.belongsTo(Category, {
    foreignKey: "category_id",
    as: "category",
  });

  User.hasMany(Room, {
    foreignKey: "owner_id",
    as: "ownedRooms",
  });

  Room.belongsTo(User, {
    foreignKey: "owner_id",
    as: "owner",
  });

  User.hasMany(RoomParticipant, {
    foreignKey: "user_id",
    as: "roomParticipations",
  });

  RoomParticipant.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  Room.hasMany(RoomParticipant, {
    foreignKey: "room_id",
    as: "participants",
  });

  RoomParticipant.belongsTo(Room, {
    foreignKey: "room_id",
    as: "room",
  });

  User.hasMany(Message, {
    foreignKey: "user_id",
    as: "messages",
  });

  Message.belongsTo(User, {
    foreignKey: "user_id",
    as: "sender",
  });

  Room.hasMany(Message, {
    foreignKey: "room_id",
    as: "messages",
  });

  Message.belongsTo(Room, {
    foreignKey: "room_id",
    as: "room",
  });

  Message.belongsTo(Message, {
    as: "replyMessage",
    foreignKey: "reply_message_id",
  });
};

applyAssociations();

module.exports = {
  sequelize,
  User,
  Category,
  Room,
  RoomParticipant,
  Message,
};
