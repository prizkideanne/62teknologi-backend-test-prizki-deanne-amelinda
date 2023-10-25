require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models");

const secretKey = process.env.JWT_SECRET_KEY;

// controllers
const register = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { name, email, password } = req.body;

    const user = await db.User.findOne({ where: { email } });
    if (user) {
      return res.status(400).send({ message: "Email is unavailable." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.User.create(
      {
        name,
        email,
        password: hashedPassword,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(201).send({
      message: "Registration success!",
      data: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.log("REGISTER ERROR", error);
    res.status(500).send({ message: "Something wrong on server.", error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.User.findOne({ where: { email } });
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!user || !checkPassword) {
      return res.status(400).send({ message: "Incorrect email or password." });
    }

    const accessToken = jwt.sign({ id: user.id }, secretKey);

    res.status(200).send({
      message: "Login success!",
      data: {
        accessToken: accessToken,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR", error);
    res.status(500).send({ message: "Something wrong on server.", error });
  }
};

module.exports = {
  register,
  login,
};
