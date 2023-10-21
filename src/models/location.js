"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Location.belongsTo(models.Business, { foreignKey: "business_id" });
    }
  }
  Location.init(
    {
      business_id: DataTypes.INTEGER,
      address: DataTypes.TEXT,
      city: DataTypes.STRING,
      zip_code: DataTypes.STRING,
      country: DataTypes.STRING,
      state: DataTypes.STRING,
      latitude: DataTypes.STRING,
      longitude: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Location",
      paranoid: true,
      timestamps: true,
    }
  );
  return Location;
};
