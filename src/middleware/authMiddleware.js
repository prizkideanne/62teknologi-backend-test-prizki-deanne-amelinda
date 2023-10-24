const jwt = require("jsonwebtoken");
const db = require("../models");

const secretKey = process.env.JWT_SECRET_KEY;

module.exports = {
  async verifyAccessToken(req, res, next) {
    // check token valid or not
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).send({
        message: "Token is not found.",
      });
    }

    const [format, token] = authorization.split(" ");
    if (format.toLocaleLowerCase() === "bearer") {
      try {
        const payload = jwt.verify(token, secretKey);
        if (!payload) {
          return res.status(401).send({
            message: "Token verification failed.",
          });
        }
        req.user = payload;
        next();
      } catch (error) {
        res.status(401).send({
          message: "Invalid token.",
          error,
        });
      }
    }
  },
};
