const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

require("./routes/middlewares/mongo");

require("dotenv-flow").config();

const app = express();
const port = 5000;

app.use(cors());
app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));

app.set("jwt", process.env.JWT_SECRET);

app.use("/api", require("./routes/api"));

app.listen(port, () => {
  console.log(`Listening at ${process.env.DOMAIN}:${port}`);
});
