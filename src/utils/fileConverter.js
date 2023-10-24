const path = require("path");

module.exports = {
  setFromFileNameToDBValue(filename) {
    return `/static/${filename}`;
  },
  getAbsolutePathPublicFile(filename) {
    const public = path.join(__dirname, "..", "public");
    return `${public}/${filename}`;
  },
  getFilenameFromDbValue(dbValue) {
    const split = dbValue.split("/");
    if (split.length < 3) {
      return "";
    }
    return split[2];
  },
};
