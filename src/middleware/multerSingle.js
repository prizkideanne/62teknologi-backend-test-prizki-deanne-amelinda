const multer = require("multer");
const path = require("path");

const public = path.join(__dirname, "..", "public");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, public);
  },
  filename: (req, file, cb) => {
    const fileName = `PIMG-${Date.now()}${Math.round(
      Math.random() * 10000000
    )}.${file.mimetype.split("/")[1]}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype;
  switch (mimeType) {
    case "image/jpg":
    case "image/jpeg":
    case "image/gif":
    case "image/png":
      cb(null, true);
      break;
    default:
      cb(new Error("File format is not matched"), false);
  }
};

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1000 * 1000 }, // Limit set to 1MB
}).single("file");

module.exports = (req, res, next) => {
  uploadMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      if (err.code === "LIMIT_FILE_SIZE") {
        err.message = "File size is too big";
      } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
        err.message = "Maximun file to upload is 1";
      }
      return res.status(400).send({ error: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).send({ error: err.message });
    }
    // Everything went fine.
    next();
  });
};
