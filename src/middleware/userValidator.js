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

    res.status(400).json({ errors: errors.array() });
  };
};

module.exports = {
  validateRegister: validate([
    body("name")
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ max: 50 })
      .withMessage("Maximum character is 50."),
    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please enter with email format."),
    body("password")
      .notEmpty()
      .withMessage("Please fill in your password.")
      .isLength({ min: 8 })
      .withMessage("Minimum password length is 8 characters.")
      .isStrongPassword({
        minSymbols: 0,
      })
      .withMessage(
        "Password must contain minimum 1 uppercase, 1 lowercase and 1 number."
      ),
  ]),

  validateLogin: validate([
    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please enter with email format."),
    body("password").notEmpty().withMessage("Please fill in your password."),
  ]),
};
