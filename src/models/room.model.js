const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Room = sequelize.define(
    "Room",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "rooms",
      freezeTableName: true,
      underscored: true,
      timestamps: false,
    }
  );

  return Room;
};
