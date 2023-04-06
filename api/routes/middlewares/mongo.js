const mongoose = require("mongoose");
require("dotenv-flow").config();

const uri = process.env.MONGO_URI;

const db = require("../models");

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("MongoDB disconnected due to application termination");
    process.exit(0);
  });
});

(async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(uri);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Connection Error: ", err);
    process.exit(1);
  }
})();

db.mongoose = mongoose;
db.uri = uri;

module.exports = db;
