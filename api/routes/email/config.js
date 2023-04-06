const Imap = require("imap-simple");
const db = require("../models");
const User = db.user;

const getAppPassword = async (email) => {
  const user = await User.findOne({ email });

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
    Buffer.from(user.appPassword, "base64")
  );

  return decryptedData.toString();
};

const getImapConfig = (email) => {
  if (!email) throw new Error("Email is missing");

  password = getAppPassword(email);

  return {
    user: email,
    password,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  };
};

const getImapConnection = (email) => {
  const imapConfig = getImapConfig(email);
  return new Imap(imapConfig);
};

module.exports = { getImapConnection };
