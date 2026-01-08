const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Message = sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      room_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
      },
      message_type: {
        type: DataTypes.ENUM("text", "image"),
        allowNull: false,
      },
      image_url: {
        type: DataTypes.TEXT,
      },
      reply_message_id: {
        type: DataTypes.UUID,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "messages",
      freezeTableName: true,
      underscored: true,
      timestamps: false,
      indexes: [
        {
          name: "idx_messages_room",
          fields: ["room_id"],
        },
        {
          name: "idx_messages_user",
          fields: ["user_id"],
        },
        {
          name: "idx_messages_reply",
          fields: ["reply_message_id"],
        },
      ],
    }
  );

  return Message;
};
