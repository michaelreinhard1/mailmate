const db = require("../models");
const User = db.user;
const express = require("express");
const app = express();
const { google } = require("googleapis");
const crypto = require("crypto");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

const getAppPassword = async (email) => {
  const user = await User.findOne({ email });

  const appPassword = user.appPassword;

  if (!appPassword) return null;

  const base64PrivateKey = process.env.RSA_PRIVATE_KEY;

  const privateKey = Buffer.from(base64PrivateKey, "base64");

  const decryptedData = crypto.privateDecrypt(
    {
      key: privateKey,
      // In order to decrypt the data, we need to specify the
      // same hashing function and padding scheme that we used to
      // encrypt the data in the previous step
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(appPassword, "base64")
  );

  return decryptedData.toString();
};

const getContacts = async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

  const APP_PASSWORD = await getAppPassword(req.user.email);

  const { tokens } = await oauth2Client.getToken(code);
  const ACCESS_TOKEN = tokens.access_token;
  const REFRESH_TOKEN = tokens.refresh_token;

  oauth2Client.setCredentials({
    access_token: ACCESS_TOKEN,
    refresh_token: REFRESH_TOKEN,
    password: APP_PASSWORD,
  });
  const contacts = await google
    .people({ version: "v1", auth: oauth2Client })
    .people.connections.list({
      resourceName: "people/me",
      personFields: "names,emailAddresses,phoneNumbers",
    })
    .then((response) => {
      return response.data.connections;
    })
    .catch((err) => {
      console.error(err);
    });
};

app.get("/get", getContacts);

module.exports = app;
