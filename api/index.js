const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

require("./routes/middlewares/mongo");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// cess to XMLHttpRequest at 'https://mailmate-api.herokuapp.com/api/auth/signin/google' from origin 'https://mailmate.michaelreinhard.be' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

const corsOptions = {
  origin: "*", // "https://mailmate.michaelreinhard.be",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
console.log(corsOptions);

app.use(bodyParser.urlencoded({ extended: true, limit: "25mb" }));

app.set("jwt", process.env.JWT_SECRET);

app.use("/api", require("./routes/api"));

app.listen(port, () => {
  console.log(`Listening at ${process.env.DOMAIN}:${port}`);
});
