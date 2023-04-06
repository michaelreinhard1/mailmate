const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

require("./routes/middlewares/mongo");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.APP_URL,
  optionsSuccessStatus: 200,
  methods: "GET,PUT,POST,DELETE",
  allowedHeaders:
    "Content-Type, Authorization, Origin, X-Requested-With, Accept",
  exposedHeaders: "Authorization",
};

app.use(cors(corsOptions));
app.use(morgan("dev"));

app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));

app.set("jwt", process.env.JWT_SECRET);

app.use("/api", require("./routes/api"));

app.listen(port, () => {
  console.log(`Listening at ${process.env.DOMAIN}:${port}`);
});
