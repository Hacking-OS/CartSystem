const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define(
    'subcategory',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      categoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subCategoryName: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

