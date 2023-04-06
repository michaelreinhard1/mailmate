const express = require("express");
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 2000,
});

const app = express.Router();

const authJwt = require("./auth/authJwt");

// var log = console.log;
// console.log = function () {
//   log.apply(console, arguments);
//   // Print the stack trace
//   console.trace();
// };

app.use("/", apiLimiter);

app.use("/auth", require("./auth"));

app.use("/", authJwt.verifyToken);

app.use("/email", require("./email"));

app.use("/ai", require("./ai"));

module.exports = app;
