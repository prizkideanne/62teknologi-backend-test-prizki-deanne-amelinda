require("dotenv/config");
const express = require("express");
const PORT = process.env.PORT || 8000;
const routes = require("./routes");

const app = express();
app.use(express.json());

app.use("/api/user", routes.user);

app.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`);
  } else {
    console.log(`APP RUNNING at ${PORT} ✅`);
  }
});
