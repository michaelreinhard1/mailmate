const mongoose = require("mongoose"); //mongoose is used to connect to the mongodb database
mongoose.Promise = global.Promise; //this is a promise to connect to the database

const db = {}; //this is the db object

db.mongoose = mongoose;
db.user = require("./user");

module.exports = db;
