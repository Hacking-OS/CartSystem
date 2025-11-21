const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'user_message',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userEmail: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userName: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userMessage: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      uuid_User: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      messagedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: false,
    }
  );

