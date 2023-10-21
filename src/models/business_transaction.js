"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Business_transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Business_transaction.belongsTo(models.Business, {
        foreignKey: "business_id",
      });
      Business_transaction.belongsTo(models.Transaction, {
        foreignKey: "transaction_id",
      });
    }
  }
  Business_transaction.init(
    {
      business_id: DataTypes.INTEGER,
      transaction_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Business_transaction",
      paranoid: true,
      timestamps: true,
    }
  );
  return Business_transaction;
};
