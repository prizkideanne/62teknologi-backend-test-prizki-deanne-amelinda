"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Business extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Business.belongsTo(models.User, { foreignKey: "user_id" });
      Business.hasOne(models.Location, { foreignKey: "business_id" });
      Business.hasMany(models.Business_transaction, {
        foreignKey: "business_id",
      });
      Business.hasMany(models.Business_category, { foreignKey: "business_id" });
    }
  }
  Business.init(
    {
      user_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      alias: DataTypes.STRING,
      image_url: DataTypes.TEXT,
      price: DataTypes.STRING,
      phone: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Business",
      paranoid: true,
      timestamps: true,
    }
  );
  return Business;
};
