const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.MONGO_URL;

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
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Connection Error: ", err);
    process.exit(1);
  }
})();

db.mongoose = mongoose;
db.url = url;

module.exports = db;
