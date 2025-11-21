const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'users',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'user',
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      loggedIn: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      country: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      state: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      city: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      address: {
        type: DataTypes.TEXT,
        defaultValue: '',
      },
      address2: {
        type: DataTypes.TEXT,
        defaultValue: '',
      },
      firstName: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      lastName: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      fullName: {
        type: DataTypes.STRING,
        defaultValue: '',
      },
      gender: {
        type: DataTypes.STRING(1),
        defaultValue: 'N',
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

