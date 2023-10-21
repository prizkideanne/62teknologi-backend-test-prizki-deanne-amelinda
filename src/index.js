require("dotenv/config");
const express = require("express");
const PORT = process.env.PORT || 8000;

const app = express();

app.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`);
  } else {
    console.log(`APP RUNNING at ${PORT} ✅`);
  }
});
