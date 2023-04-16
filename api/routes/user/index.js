const db = require("../models");
const User = db.user;
// const bcrypt = require("bcryptjs");
const express = require("express");
const crypto = require("crypto");
const Imap = require("imap");

const app = express();

const saveAppPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { email } = req.user;

    const base64PublicKey = process.env.RSA_PUBLIC_KEY;
    const publicKey = Buffer.from(base64PublicKey, "base64");
    const encryptedData = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(password)
    );

    const imap = new Imap({
      user: email,
      password: password,
      host: "imap.gmail.com",
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });

    imap.once("error", (err) => {
      console.log("Error connecting to IMAP server");
      return res.status(500).send("Error connecting to IMAP server");
    });

    imap.once("ready", async () => {
      try {
        await User.findOneAndUpdate(
          { email },
          { appPassword: encryptedData.toString("base64") }
        );
        return res.status(200).json({ message: "App password saved" });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error saving app password" });
      }
    });

    imap.once("end", () => {
      console.log("Connection ended");
    });

    imap.connect();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error saving app password" });
  }
};

const saveFullName = async (req, res, next) => {
  const { name } = req.body;

  const { googleId } = req.user;

  try {
    await User.findOneAndUpdate(
      { googleId },
      {
        name,
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error saving full name" });
  }

  res.status(200).json({ message: "Full name saved" });
};

const savePreferences = async (req, res, next) => {
  const { preferences } = req.body;

  const { googleId } = req.user;

  try {
    await User.findOneAndUpdate(
      { googleId },
      {
        preferences,
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error saving preferences" });
  }

  res.status(200).json({ message: "Preferences saved" });
};

app.post("/save-app-password", saveAppPassword);
app.post("/save-full-name", saveFullName);
app.post("/save-preferences", savePreferences);

module.exports = app;
