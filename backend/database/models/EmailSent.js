const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'emailSent',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      emailResults: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      log: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

