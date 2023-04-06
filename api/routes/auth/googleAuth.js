const express = require("express");
const passport = require("passport");
const app = express.Router();
const jwt = require("jsonwebtoken");
const authJwt = require("./authJwt");

const signInWithGoogle = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

app.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  function (req, res) {
    console.log("Successful authentication, redirect home.");
    // Successful authentication, redirect home.

    const user = req.user;

    // Generate token
    const userToken = { _id: user._id, email: user.email };
    const token = jwt.sign(userToken, process.env.JWT_SECRET);

    // Remove sensitive data from user object
    const profile = { ...user.toObject() };

    // Add additional properties to profile object
    if (profile.appPassword !== "") profile.setup = false;
    else profile.setup = true;

    delete profile.created;
    delete profile.password;
    delete profile.appPassword;
    delete profile.__v;

    // redirect to localhost:3000 with token and profile
    res.redirect(`http://localhost:3000/?token=${token}`);
  }
);

app.get("/google", signInWithGoogle);

app.post("/verify", authJwt.verifyToken, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});

module.exports = app;
