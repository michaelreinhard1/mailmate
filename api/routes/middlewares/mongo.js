const mongoose = require("mongoose");
require("dotenv-flow").config();

const uri = process.env.MONGO_URI;
console.log(`url: ` + uri);

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
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mongoose.set("strictQuery", false);
    console.log("Mongoose connected successfully");
  } catch (err) {
    console.error("Mongoose connection error:", err);
    process.exit(1);
  }
})();

db.mongoose = mongoose;
db.uri = uri;

module.exports = db;
