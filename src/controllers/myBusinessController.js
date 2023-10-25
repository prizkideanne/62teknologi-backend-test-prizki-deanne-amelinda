const db = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const {
  setFromFileNameToDBValue,
  getFilenameFromDbValue,
  getAbsolutePathPublicFile,
} = require("../utils/fileConverter");

const createBusiness = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const id = req.user.id;
    const {
      name,
      price,
      phone,
      address,
      city,
      zip_code,
      country,
      state,
      latitude,
      longitude,
    } = req.body;
    let image_url;
    let category;
    let transactionList;

    if (req.file) {
      image_url = setFromFileNameToDBValue(req.file.filename);
    }

    const generateAlias = async (name, city) => {
      const formatName = name.replace(/ /g, "-").toLowerCase();
      const formatCity = city.replace(/ /g, "-").toLowerCase();

      const randomNumbers = Math.floor(1000 + Math.random() * 9000);

      const alias = `${formatName}-${formatCity}-${randomNumbers}`;

      return alias;
    };

    const newBusiness = await db.Business.create(
      {
        user_id: id,
        name,
        image_url,
        alias: await generateAlias(name, city),
        price,
        phone,
      },
      { transaction }
    );

    const location = await db.Location.create(
      {
        business_id: newBusiness.id,
        address,
        city,
        zip_code,
        country,
        state,
        latitude,
        longitude,
      },
      { transaction }
    );

    if (req.body.categories) {
      category = req.body.categories.split(",").map((id) => ({
        business_id: newBusiness.id,
        category_id: Number(id),
      }));
      const businessCategory = await db.Business_category.bulkCreate(category, {
        transaction,
      });
    }

    if (req.body.transactions) {
      transactionList = req.body.transactions.split(",").map((id) => ({
        business_id: newBusiness.id,
        transaction_id: Number(id),
      }));
      const businessTransaction = await db.Business_transaction.bulkCreate(
        transactionList,
        { transaction }
      );
    }

    await transaction.commit();
    const business = await db.Business.findOne({
      where: { alias: newBusiness.alias },
      attributes: { exclude: ["id", "createdAt", "updatedAt", "deletedAt"] },
    });

    res
      .status(200)
      .send({ message: "Success create new business!", data: business });
  } catch (error) {
    await transaction.rollback();
    console.log("CREATE BUSINESS", error);
    res.status(500).send({ message: "Something wrong on server.", error });
  }
};

const editBusiness = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user_id = req.user.id;
    const id = req.params.id;

    const {
      name,
      price,
      phone,
      address,
      city,
      zip_code,
      country,
      state,
      latitude,
      longitude,
    } = req.body;
    let image_url;
    let newCategories;
    let newTransactions;

    const business = await db.Business.findOne({ where: { id, user_id } });
    if (!business) {
      return res.status(400).send({ message: "Business not found." });
    }

    if (req.file) {
      const oldImage = business.getDataValue("image_url");

      const oldImageFile = getFilenameFromDbValue(oldImage);

      if (oldImage) {
        fs.unlinkSync(getAbsolutePathPublicFile(oldImageFile));
      }
      image_url = setFromFileNameToDBValue(req.file.filename);
    }
    const editedBusiness = await db.Business.update(
      {
        name,
        price,
        phone,
        image_url,
      },
      { where: { id, user_id }, transaction }
    );

    const editedLocation = await db.Location.update(
      {
        address,
        city,
        zip_code,
        country,
        state,
        latitude,
        longitude,
      },
      { where: { business_id: id }, transaction }
    );

    if (req.body.categories) {
      newCategories = req.body.categories.split(",").map((id) => Number(id));

      // business category logic
      const existingCategories = await db.Business_category.findAll({
        where: { business_id: id },
      });

      const categoriesToDelete = existingCategories
        .filter((category) => !newCategories.includes(category.category_id))
        .map((category) => category.category_id);

      await db.Business_category.destroy({
        where: {
          business_id: id,
          category_id: categoriesToDelete,
        },
        transaction,
      });

      for (const category of newCategories) {
        const existingCategory = await db.Business_category.findOne({
          where: {
            business_id: id,
            category_id: category,
          },
          paranoid: false,
          transaction,
        });

        if (!existingCategory) {
          await db.Business_category.create(
            {
              business_id: id,
              category_id: category,
            },
            { paranoid: false, transaction }
          );
        } else if (existingCategory.deletedAt) {
          await existingCategory.restore({
            where: { category_id: category },
            transaction,
          });
        }
      }
    }

    if (req.body.transactions) {
      newTransactions = req.body.transactions
        .split(",")
        .map((tid) => Number(tid));

      // business transaction logic
      const existingTransaction = await db.Business_transaction.findAll({
        where: { business_id: id },
      });

      const transactionToDelete = existingTransaction
        .filter((trsc) => !newTransactions.includes(trsc.transaction_id))
        .map((trsc) => trsc.transaction_id);

      await db.Business_transaction.destroy({
        where: {
          business_id: id,
          transaction_id: transactionToDelete,
        },
        transaction,
      });

      for (const trsc of newTransactions) {
        const existingTransaction = await db.Business_transaction.findOne({
          where: {
            business_id: id,
            transaction_id: trsc,
          },
          paranoid: false,
          transaction,
        });

        if (!existingTransaction) {
          await db.Business_transaction.create(
            {
              business_id: id,
              transaction_id: trsc,
            },
            { paranoid: false, transaction }
          );
        } else if (existingTransaction.deletedAt) {
          await existingTransaction.restore({
            where: { transaction_id: trsc },
            transaction,
          });
        }
      }
    }

    await transaction.commit();
    const result = await db.Business.findOne({
      where: { id },
      include: [
        {
          model: db.Location,
        },
        { model: db.Business_category },
        { model: db.Business_transaction },
      ],
    });

    res.status(200).send({ message: "Success edit business.", data: result });
  } catch (error) {
    await transaction.rollback();
    console.log("EDIT BUSINESS", error);
    res.status(500).send({ message: "Something wrong on server", error });
  }
};

const getMyBusiness = async (req, res) => {
  try {
    const id = req.params.id;
    const user_id = req.user.id;

    const result = await db.Business.findOne({
      where: { id, user_id, deletedAt: null },
      include: [
        {
          model: db.Location,
        },
        { model: db.Business_category, include: db.Category },
        { model: db.Business_transaction, include: db.Transaction },
      ],
    });

    if (!result) {
      return res.status(400).send({ message: "Business not found." });
    }

    const convertPrice = (price) => {
      switch (price) {
        case "1":
          return "$";
        case "2":
          return "$$";
        case "3":
          return "$$$";
        case "4":
          return "$$$$";
        default:
          return "-";
      }
    };

    const response = {
      message: "Success get business detail",
      data: {
        name: result.name,
        alias: result.alias,
        image_url: result.image_url,
        price: convertPrice(result.price),
        phone: result.phone,
        location: {
          address: result.Location.address,
          city: result.Location.city,
          zip_code: result.Location.zip_code,
          country: result.Location.country,
          state: result.Location.state,
          latitude: result.Location.latitude,
          longitude: result.Location.longitude,
        },
        categories: result.Business_categories.map((category) => ({
          title: category.Category.title,
          alias: category.Category.alias,
        })),
        transactions: result.Business_transactions.map((transaction) => ({
          title: transaction.Transaction.title,
        })),
      },
    };
    res.status(200).send(response);
  } catch (error) {
    console.log("GET MY BUSINESS", error);
    res.status(500).send({ message: "Something wrong on server.", error });
  }
};

const AllMyBusinesses = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { limit, offset, price, location, sort_by } = req.query;

    let order = [];
    let wherePrice = {};
    let whereLocation = {};
    let limitValue = 5;
    let offsetValue = 0;

    if (limit) {
      limitValue = Number(limit);
    }

    if (offset) {
      offsetValue = Number(offset) * limitValue;
    }

    switch (sort_by) {
      case "name_DESC":
        order = [["name", "DESC"]];
        break;
      case "name_ASC":
        order = [["name", "ASC"]];
        break;
      default:
        order = [["createdAt", "DESC"]];
    }

    if (price) {
      wherePrice = { price: Number(price) };
    }

    if (location) {
      whereLocation = {
        city: db.sequelize.where(
          db.sequelize.fn("LOWER", db.sequelize.col("city")),
          "LIKE",
          "%" + location.toLowerCase() + "%"
        ),
      };
    }

    const { count, rows } = await db.Business.findAndCountAll({
      where: { user_id, deletedAt: null, ...wherePrice },
      order,
      include: [
        {
          model: db.Location,
          where: whereLocation,
        },
        { model: db.Business_category, include: db.Category },
        { model: db.Business_transaction, include: db.Transaction },
      ],
      distinct: true,
      limit: limitValue,
      offset: offsetValue,
    });

    if (!rows || rows.length === 0) {
      return res.status(400).send({ message: "Can not get businesses." });
    }

    const convertPrice = (price) => {
      switch (price) {
        case "1":
          return "$";
        case "2":
          return "$$";
        case "3":
          return "$$$";
        case "4":
          return "$$$$";
        default:
          return "-";
      }
    };
    const data = rows.map((row) => ({
      name: row.name,
      alias: row.alias,
      image_url: row.image_url,
      price: convertPrice(row.price),
      phone: row.phone,
      location: {
        address: row.Location.address,
        city: row.Location.city,
        zip_code: row.Location.zip_code,
        country: row.Location.country,
        state: row.Location.state,
        latitude: row.Location.latitude,
        longitude: row.Location.longitude,
      },
      categories: row.Business_categories.map((category) => ({
        title: category.Category.title,
        alias: category.Category.alias,
      })),
      transactions: row.Business_transactions.map((transaction) => ({
        title: transaction.Transaction.title,
      })),
    }));

    const response = {
      message: "Success get all of my business.",
      totalData: count,
      data,
    };

    res.status(200).send(response);
  } catch (error) {
    console.log("GET ALL MY BUSINESS", error);
    res.status(500).send({ message: "Something wrong on server.", error });
  }
};

const deleteBusiness = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const user_id = req.user.id;
    const id = req.params.id;

    const business = await db.Business.findOne({
      where: { id, user_id, deletedAt: null },
    });

    const businessTransaction = await db.Business_transaction.findAll({
      where: { business_id: id },
    });

    const businessCategory = await db.Business_category.findAll({
      where: { business_id: id },
    });

    if (!business) {
      return res.status(400).send({ message: "Business not found." });
    }

    if (businessTransaction.length > 0) {
      const deleteTransaction = await db.Business_transaction.destroy({
        where: { business_id: id },
        transaction,
      });
    }

    if (businessCategory.length > 0) {
      const deleteCategory = await db.Business_category.destroy({
        where: { business_id: id },
        transaction,
      });
    }

    const deleteLocation = await db.Location.destroy({
      where: { business_id: id },
      transaction,
    });

    const deleteBusiness = await db.Business.destroy({
      where: { id },
      transaction,
    });

    await transaction.commit();
    res.status(200).send({ message: "Delete business success." });
  } catch (error) {
    await transaction.rollback();
    console.log("DELETE BUSINESS", error);
    res.status(500).send({ message: "Something wrong on server.", error });
  }
};
module.exports = {
  createBusiness,
  editBusiness,
  getMyBusiness,
  AllMyBusinesses,
  deleteBusiness,
};
