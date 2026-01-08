const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RoomParticipant = sequelize.define(
    "RoomParticipant",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      room_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "room_participants",
      freezeTableName: true,
      underscored: true,
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["user_id", "room_id"],
        },
      ],
    }
  );

  return RoomParticipant;
};
