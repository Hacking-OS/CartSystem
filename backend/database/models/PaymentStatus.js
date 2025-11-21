const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'payment_status',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      paymentStatusName: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

