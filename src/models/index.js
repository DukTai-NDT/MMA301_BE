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
  // Category - Room
  Category.hasMany(Room, { foreignKey: "category_id" });
  Room.belongsTo(Category, { foreignKey: "category_id" });

  // User - Room (owner)
  User.hasMany(Room, { foreignKey: "owner_id" });
  Room.belongsTo(User, { foreignKey: "owner_id" });

  // User - RoomParticipant
  User.hasMany(RoomParticipant, { foreignKey: "user_id" });
  RoomParticipant.belongsTo(User, { foreignKey: "user_id" });

  // Room - RoomParticipant
  Room.hasMany(RoomParticipant, { foreignKey: "room_id" });
  RoomParticipant.belongsTo(Room, { foreignKey: "room_id" });

  // User - Message
  User.hasMany(Message, { foreignKey: "user_id" });
  Message.belongsTo(User, { foreignKey: "user_id" });

  // Room - Message
  Room.hasMany(Message, { foreignKey: "room_id" });
  Message.belongsTo(Room, { foreignKey: "room_id" });

  // Message reply (self reference)
  Message.belongsTo(Message, {
    as: "reply_message",
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
