"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Business_category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Business_category.belongsTo(models.Business, {
        foreignKey: "business_id",
      });
      Business_category.belongsTo(models.Category, {
        foreignKey: "category_id",
      });
    }
  }
  Business_category.init(
    {
      business_id: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Business_category",
      paranoid: true,
      timestamps: true,
    }
  );
  return Business_category;
};
