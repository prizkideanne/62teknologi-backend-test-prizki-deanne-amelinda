const router = require("express").Router();
const myBusiness = require("../controllers/myBusinessController");
const validator = require("../middleware/businessValidator");
const auth = require("../middleware/authMiddleware");
const multer = require("../middleware/multerSingle");

router.post(
  "/create",
  auth.verifyAccessToken,
  multer,
  validator.validateCreateBusiness,
  myBusiness.createBusiness
);

router.put(
  "/edit/:id",
  auth.verifyAccessToken,
  multer,
  myBusiness.editBusiness
);

router.get("/search", auth.verifyAccessToken, myBusiness.AllMyBusinesses);

router.get("/:id", auth.verifyAccessToken, myBusiness.getMyBusiness);

router.delete("/delete/:id", auth.verifyAccessToken, myBusiness.deleteBusiness);

module.exports = router;
