const router = require("express").Router();
const user = require("../controllers/userController");
const validator = require("../middleware/userValidator");

router.post("/register", validator.validateRegister, user.register);
router.post("/login", validator.validateLogin, user.login);

module.exports = router;
