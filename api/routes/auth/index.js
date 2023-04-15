const db = require("../models");
const User = db.user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const authJwt = require("./authJwt");

const app = express();

const signup = async (req, res) => {
  const user = new User({
    googleId: req.body.googleId,
    email: req.body.email,
    fname: req.body.fname,
    lname: req.body.lname,
    name: req.body.name,
    picture: req.body.picture,
  });

  try {
    await user.save();
    signin(req, res);
  } catch (err) {
    console.error("Error signing up user: ", err);
    res.status(500).json({ message: err });
  }
};

const signin = (req, res) => {
  try {
    // Find user in database
    User.findOne({ googleId: req.body.googleId }).exec((err, user) => {
      if (err) {
        // Error handling
        console.error(`Error finding user: ${err}`);
        res.status(500).json({ message: "An error occurred." });
        return;
      }

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Generate token
      const userToken = {
        googleId: user.googleId,
        email: user.email,
        name: user.name,
      };
      const token = jwt.sign(userToken, process.env.JWT_SECRET);

      // Remove sensitive data from user object
      const profile = { ...user.toObject() };

      // Add additional properties to profile object
      if (profile.appPassword !== "") profile.setup = false;
      else profile.setup = true;

      delete profile.googleId;
      delete profile.created;
      delete profile.password;
      delete profile.appPassword;
      delete profile.__v;
      delete profile._id;

      // Return token and profile
      res.status(200).json({ token, profile });
    });
  } catch (error) {
    // Error handling
    console.error(`Error signing in user: ${error}`);
    res.status(500).json({ message: "An error occurred." });
  }
};

async function verifyCode(code) {
  const tokens = await client.getToken(code);
  client.setCredentials(tokens.tokens);

  const userinfo = await client.request({
    url: "https://www.googleapis.com/oauth2/v3/userinfo/",
  });
  return { data: userinfo.data, tokens: tokens.tokens };
}

const signInWithGoogle = async (req, res) => {
  const { code } = req.body;

  await verifyCode(code).then(async ({ data, tokens }) => {
    const sub = data["sub"];
    const email = data["email"];
    const email_verified = data["email_verified"];
    const given_name = data["given_name"];
    const family_name = data["family_name"];
    const picture = data["picture"];

    const name = given_name + " " + family_name;

    if (email_verified) {
      const user = await User.findOne({ googleId: sub }).exec();

      if (user) {
        signin({ body: { googleId: sub } }, res);
      } else {
        signup(
          {
            body: {
              googleId: sub,
              email,
              fname: given_name,
              lname: family_name,
              name,
              picture: picture,
            },
          },
          res
        );
      }
    } else {
      res.status(400).json({ message: "Email not verified" });
    }
  });
};

app.post("/signin", signin);
// app.post("/signin/google", signInWithGoogle);
app.post("/signin/google", signInWithGoogle);

app.post("/verify", authJwt.verifyToken, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});

module.exports = app;
