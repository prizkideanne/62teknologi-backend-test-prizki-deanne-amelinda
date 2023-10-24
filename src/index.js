require("dotenv/config");
const express = require("express");
const PORT = process.env.PORT || 8000;
const routes = require("./routes");
const { join } = require("path");

const app = express();
app.use(express.json());
app.use("/api/static", express.static(join(__dirname, "public")));

app.use("/api/user", routes.user);
app.use("/api/my-business", routes.myBusiness);

app.use((req, res, next) => {
  if (req.path.includes("/api/")) {
    res.status(404).send("Not found!");
  } else {
    next();
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`);
  } else {
    console.log(`APP RUNNING at ${PORT} ✅`);
  }
});
