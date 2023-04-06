const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleId: { type: String, default: "", required: true, unique: true },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
    maxLength: 100,
  },
  picture: { type: String, default: "" },
  fname: { type: String, default: "", maxLength: 100 },
  lname: { type: String, default: "", maxLength: 100 },
  name: { type: String, default: "", maxLength: 100 },
  created: { type: Date, default: Date.now },
  appPassword: { type: String, default: "" },
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.hash_password);
};

const User = mongoose.model("user", UserSchema);
module.exports = User;
