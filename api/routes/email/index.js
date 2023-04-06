const db = require("../models");
const User = db.user;
const express = require("express");
const app = express();
const cheerio = require("cheerio");

const Imap = require("imap");
inspect = require("util").inspect;
const simpleParser = require("mailparser").simpleParser;
const nodemailer = require("nodemailer");
const emailValidator = require("deep-email-validator");
const crypto = require("crypto");

const saveAppPassword = async (req, res) => {
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

  const user = await User.findOne({ email });

  user.appPassword = encryptedData.toString("base64");

  await user.save();

  // Check if the password is correct
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
    res.status(500).send("Error connecting to IMAP server");
  });

  imap.once("ready", async () => {
    res.status(200).json({ message: "App password saved" });
  });

  imap.once("end", () => {
    console.log("Connection ended");
  });

  imap.connect();
};

const saveFullName = async (req, res, next) => {
  const { name } = req.body;

  const { email } = req.user;

  const user = await User.findOne({ email });

  user.name = name;

  await user.save();

  res.status(200).json({ message: "Full name saved" });
};

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

const getEmails = async (req, res) => {
  const { email } = req.user;

  const { page, box } = req.body;

  if (!page || !box) {
    throw new Error("Page and box are required");
  }

  if (!["INBOX", "STARRED", "SENT", "DRAFTS", "TRASH", "SPAM"].includes(box)) {
    throw new Error("Invalid box");
  }

  const password = await getAppPassword(email);

  if (!password)
    return res.status(404).json({
      message: "App password not found. Please save it first",
      status: 0,
    });
  // If the connection failes, send status 500 and stop the function

  const imap = new Imap({
    user: email,
    password: password,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });

  // imap.once("ready", function () {
  //   imap.getBoxes(function (err, boxes) {
  //     // get the object where attribute includes \\Drafts
  //     drafts = Object.values(boxes["[Gmail]"].children).find((box) =>
  //       box.attribs.includes("\\Drafts")
  //     );
  //   });
  // });

  const emails = [];

  let totalEmails = 0;
  let unreadEmails = 0;

  // imap.once("ready", function () {
  //   imap.openBox("INBOX", false, function (err, box) {
  //     // Get the messages flagged as draft
  //     //     const emailsPerPage = 50;
  //     //     totalEmails = box.messages.total;
  //     //     const start = totalEmails - (page - 1) * emailsPerPage;
  //     //     const end = start - emailsPerPage;

  //     imap.search([searchCriteria], function (err, results) {
  //       if (results.length === 0)
  //         return res
  //           .status(200)
  //           .json({ emails: [], totalEmails: 0, unreadEmails: 0 });
  //       if (err) throw err;
  //       const f = imap.fetch(results, {
  //         bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
  //         struct: true,
  //       });
  //       f.on("message", function (msg, seqno) {
  //         let message = { uid: seqno };
  //         let prefix = "(#" + seqno + ") ";
  //         msg.on("body", function (stream, info) {
  //           let buffer = "";
  //           stream.on("data", function (chunk) {
  //             buffer += chunk.toString("utf8");
  //           });
  //           stream.once("end", function () {
  //             // console.log(
  //             //   prefix + "Parsed header: %s",
  //             //   inspect(Imap.parseHeader(buffer))
  //             // );
  //             message = { ...message, ...Imap.parseHeader(buffer) };
  //           });
  //         });
  //         msg.once("attributes", function (attrs) {
  //           message = { ...message, ...attrs };
  //         });
  //         msg.once("end", function () {
  //           emails.push(message);
  //         });
  //       });
  //       f.once("error", function (err) {
  //         console.log("Fetch error: " + err);
  //       });
  //       f.once("end", function () {
  //         console.log(emails);
  //         console.log("Done fetching all messages!");
  //         imap.end();
  //       });
  //     });
  //   });
  // });

  // imap.once("ready", function () {
  //   // Get the drafts
  //   openInbox(function (err, box) {
  //     imap.search(["ALL"], function (err, results) {
  //       if (err) throw err;
  //       const f = imap.fetch(results, {
  //         bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
  //         struct: true,
  //       });
  //       f.on("message", function (msg, seqno) {
  //         let message = { uid: seqno };
  //         let prefix = "(#" + seqno + ") ";
  //         msg.on("body", function (stream, info) {
  //           let buffer = "";
  //           stream.on("data", function (chunk) {
  //             buffer += chunk.toString("utf8");
  //           });
  //           stream.once("end", function () {
  //             // console.log(
  //             //   prefix + "Parsed header: %s",
  //             //   inspect(Imap.parseHeader(buffer))
  //             // );
  //             message = { ...message, ...Imap.parseHeader(buffer) };
  //           });
  //         });
  //         msg.once("attributes", function (attrs) {
  //           message = { ...message, ...attrs };
  //         });
  //         msg.once("end", function () {
  //           emails.push(message);
  //         });
  //       });
  //       f.once("error", function (err) {
  //         console.log("Fetch error: " + err);
  //       });
  //       f.once("end", function () {
  //         console.log(messages);
  //         console.log("Done fetching all messages!");
  //         imap.end();
  //       });
  //     });
  //   });
  // });

  let specialUseAttrib;

  switch (box) {
    case "DRAFTS":
      specialUseAttrib = "\\Drafts";
      break;
    case "STARRED":
      specialUseAttrib = "\\Flagged";
      break;
    case "SENT":
      specialUseAttrib = "\\Sent";
      break;
    case "TRASH":
      specialUseAttrib = "\\Trash";
      break;
    case "SPAM":
      specialUseAttrib = "\\Junk";
      break;
    default:
      specialUseAttrib = "\\Inbox";
      break;
  }

  imap.once("ready", function () {
    imap.getBoxes(function (err, boxes) {
      // Get the name of the third object from the children of '[Gmail]' object
      const children = boxes["[Gmail]"].children;

      Object.keys(children).forEach((key) => {
        if (children[key].special_use_attrib === specialUseAttrib) {
          mailboxName = `[Gmail]/${key}`;
        }
      });

      if (box === "INBOX") {
        mailboxName = "INBOX";
      }

      // First 50 emails
      imap.openBox(`${mailboxName}`, false, (err, box) => {
        imap.on("mail", function (numNewMsgs) {
          console.log(`Received ${numNewMsgs} new message(s)`);
          imap.search(["UNSEEN"], function (err, results) {
            if (err) throw err;
            var f = imap.fetch(results, { bodies: "" });
            f.on("message", function (msg, seqno) {
              console.log(`Message ${seqno}`);
              msg.on("body", function (stream, info) {
                var buffer = "";
                stream.on("data", function (chunk) {
                  buffer += chunk.toString("utf8");
                });
                stream.once("end", function () {
                  console.log(`Message body: ${inspect(buffer)}`);
                });
              });
              msg.once("end", function () {
                console.log(`Finished processing message ${seqno}`);
              });
            });
            f.once("end", function () {
              console.log("Done fetching messages");
            });
          });
        });

        if (box?.messages?.total === 0)
          return res
            .status(200)
            .json({ emails: [], totalEmails: 0, unreadEmails: 0 });
        const emailsPerPage = 50;
        totalEmails = box?.messages?.total;
        const start = totalEmails - (page - 1) * emailsPerPage;
        const end = start - emailsPerPage;
        if (err) throw err;
        const f = imap.seq.fetch(`${start}:${end}`, {
          bodies: "HEADER.FIELDS (FROM TO SUBJECT DATE)",
          struct: true,
        });
        f.on("message", function (msg, seqno) {
          let message;
          msg.on("body", function (stream, info) {
            let buffer = "";
            stream.on("data", function (chunk) {
              buffer += chunk.toString("utf8");
            });
            stream.once("end", function () {
              // console.log(
              //   prefix + "Parsed header: %s",
              //   inspect(Imap.parseHeader(buffer))
              // );
              message = { ...message, ...Imap.parseHeader(buffer) };
            });
          });
          msg.once("attributes", function (attrs) {
            // console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
            // Add the message attributes to the message object WITHOUT the uid rom the attributes
            // Add the flag \\Sent to the message object
            message = {
              ...message,
              ...attrs,
              flags: [...attrs.flags, specialUseAttrib],
            };
          });
          msg.once("end", function () {
            // console.log(prefix + "Finished");
            emails.push(message);
          });
        });
        f.once("error", function (err) {
          console.log("Fetch error");
          res.status(500).json({ error: err });
        });
        f.once("end", function () {
          // console.log("Done fetching all messages!");
          imap.end();
        });
      });

      if (box === "INBOX") {
        // Get the number of the unread emails
        imap.openBox("INBOX", false, (err, box) => {
          if (err) throw err;
          imap.search(["UNSEEN"], function (err, results) {
            if (results.length === 0) return;
            unreadEmails = results.length;
            if (err) throw err;
            var f = imap.fetch(results, { bodies: "" });
            f.once("error", function (err) {
              console.log("Fetch error");
              res.status(500).json({ error: err });
            });
            f.once("end", function () {
              // console.log("Done fetching all messages!");
              imap.end();
            });
          });
        });
      }
    });
  });

  let hasError = false;

  imap.once("error", (err) => {
    console.log(err);
    hasError = true;
    res.status(500).send("Error connecting to IMAP server");
  });

  imap.once("end", function () {
    if (totalEmails !== 0)
      if (!hasError) {
        emails.sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        });
        emails.forEach((email) => {});
        res.status(200).json({ emails, unreadEmails, totalEmails });
      }
  });

  imap.connect();
};

const getOneEmail = async (req, res) => {
  const { email } = req.user;

  const { uid, box } = req.body;

  console.log(uid, box);

  const password = await getAppPassword(email);

  const imap = new Imap({
    user: email,
    password: password,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    timeout: 60000,
  });

  let specialUseAttrib;

  switch (box) {
    case "DRAFTS":
      specialUseAttrib = "\\Drafts";
      break;
    case "STARRED":
      specialUseAttrib = "\\Flagged";
      break;
    case "SENT":
      specialUseAttrib = "\\Sent";
      break;
    case "TRASH":
      specialUseAttrib = "\\Trash";
      break;
    case "SPAM":
      specialUseAttrib = "\\Junk";
      break;
    default:
      specialUseAttrib = "\\Inbox";
      break;
  }

  let message = {};

  imap.once("ready", () => {
    imap.getBoxes(function (err, boxes) {
      // Get the name of the third object from the children of '[Gmail]' object
      const children = boxes["[Gmail]"].children;

      Object.keys(children).forEach((key) => {
        if (children[key].special_use_attrib === specialUseAttrib) {
          mailboxName = `[Gmail]/${key}`;
        }
      });

      if (box === "INBOX") {
        mailboxName = "INBOX";
      }
      imap.openBox(`${mailboxName}`, false, () => {
        imap.search([["UID", uid]], (err, results) => {
          const f = imap.fetch(results, { bodies: "" });
          f.on("message", (msg) => {
            msg.on("body", (stream) => {
              simpleParser(stream, async (err, parsed) => {
                const {
                  attachments,
                  from,
                  to,
                  html,
                  subject,
                  textAsHtml,
                  text,
                } = parsed;
                message = {
                  attachments,
                  from,
                  to,
                  html,
                  subject,
                  textAsHtml,
                  text,
                  uid,
                };
              });
            });
            msg.once("attributes", (attrs) => {
              const { uid } = attrs;
              imap.addFlags(uid, ["\\Seen"], () => {
                // Mark the email as read after reading it
                console.log("Marked as read!");
              });
            });
          });
          f.once("error", (ex) => {
            return Promise.reject(ex);
          });
          f.once("end", () => {
            console.log("Done fetching all messages!");
            imap.end();
          });
        });
      });
    });
  });

  imap.once("error", (err) => {
    res.status(500).json({ message: "Something went wrong" });
    console.log(err);
  });

  imap.once("end", () => {
    res.status(200).json({ message });
    console.log("Connection ended");
  });

  imap.connect();
};

async function isEmailValid(email) {
  return emailValidator.validate(email);
}

const send = async (req, res, next) => {
  const { to, subject, body, attachments, replyTo, inReplyTo } = req.body;
  const { email } = req.user;

  const password = await getAppPassword(email);

  const user = await User.findOne({ email });

  const name = user.name;

  console.log(name, email, password);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });

  const info = {
    from: `${name} <${email}>`,
    to,
    subject,
    html: body,
    attachments,
    ...(replyTo && { replyTo }),
    ...(inReplyTo && { inReplyTo }),
  };

  const mail = await transporter.sendMail(info, (err, info) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Something went wrong" });
    } else {
      res.status(200).json({ message: "Email sent" });
    }
  });

  console.log("Message sent: %s", mail);

  res.status(200).json({ message: "Email sent" });
};

const setFlag = async (req, res) => {
  const { email } = req.user;

  const { uid, flag } = req.body;

  let flagToSet = "";

  switch (flag) {
    case "seen":
      flagToSet = "\\Seen";
      break;
    case "unseen":
      flagToSet = "\\Unseen";
      break;
    case "flagged":
      flagToSet = "\\Flagged";
      break;
    case "unflagged":
      flagToSet = "\\Unflagged";
      break;
    case "answered":
      flagToSet = "\\Answered";
      break;
    case "unanswered":
      flagToSet = "\\Unanswered";
      break;
    case "draft":
      flagToSet = "\\Draft";
      break;
    default:
      break;
  }

  const password = await getAppPassword(email);

  const imap = new Imap({
    user: email,
    password: password,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    timeout: 60000,
  });

  // Using setFlags
  imap.once("ready", () => {
    imap.openBox("INBOX", false, () => {
      imap.setFlags(uid, ["\\UNSEEN"], () => {
        res.status(200).json({ message: "Flag set" });
        imap.end();
      });
    });
  });

  imap.once("error", (err) => {
    res.status(500).json({ message: "Something went wrong" });
    console.log(err);
  });

  imap.once("end", () => {
    console.log("Connection ended");
  });

  imap.connect();
};

app.post("/save-app-password", saveAppPassword);

app.post("/save-full-name", saveFullName);

app.post("/get", getEmails);

app.post("/get-one", getOneEmail);

app.post("/send", send);

app.post("/set-flag", setFlag);

module.exports = app;
