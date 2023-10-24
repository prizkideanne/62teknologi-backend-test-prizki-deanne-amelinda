const { check, body, validationResult } = require("express-validator");

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      console.log("val", result);
      console.log("req.body", req.body);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res
      .status(400)
      .send({ message: "Errors occured.", errors: errors.array() });
  };
};

module.exports = {
  validateCreateBusiness: validate([
    body("name").notEmpty().withMessage("Name is required."),
    body("price")
      .notEmpty()
      .withMessage("Price is required.")
      .isIn(["1", "2", "3", "4"])
      .withMessage("Invalid value."),
    body("phone").notEmpty().withMessage("Phone is required."),
    body("address").notEmpty().withMessage("Address is required."),
    body("city").notEmpty().withMessage("City is required."),
    body("zip_code").notEmpty().withMessage("Zip code is required."),
    body("country").notEmpty().withMessage("Country is required."),
    body("state").notEmpty().withMessage("State is required."),
    body("file").custom((value, { req }) => {
      if (!req.file) throw new Error("Business photo is requiered.");
      return true;
    }),
  ]),
};
