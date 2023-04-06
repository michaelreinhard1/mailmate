const express = require("express");
const openai = require("../middlewares/openai");

const { middleware, contentModeration } = require("./middleware");

const app = express.Router();

app.use("/", middleware);

app.use("/", require("./subject"));
app.use("/", require("./body"));
app.use("/", require("./autocomplete"));
app.use("/", require("./grammar"));
app.use("/", require("./attachmentDetection"));

app.use("/", contentModeration);

module.exports = app;
