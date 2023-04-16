const db = require("../models");
const User = db.user;
const express = require("express");
const app = express();
const cheerio = require("cheerio");
const sanitizeHtml = require("sanitize-html");

const Imap = require("imap");
inspect = require("util").inspect;
const simpleParser = require("mailparser").simpleParser;
const nodemailer = require("nodemailer");
const emailValidator = require("deep-email-validator");
const crypto = require("crypto");

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
    console.log("Page and box are required");
    return res.status(400).json({
      message: "Page and box are required",
      status: 0,
    });
  }

  if (!["INBOX", "STARRED", "SENT", "DRAFTS", "TRASH", "SPAM"].includes(box)) {
    return res.status(400).json({
      message: "Invalid box",
      status: 0,
    });
  }

  const password = await getAppPassword(email);

  if (!password)
    return res.status(404).json({
      message: "App password not found. Please save it first",
      status: 0,
    });

  const imap = new Imap({
    user: email,
    password: password,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });

  const emails = [];

  let totalEmails = 0;
  let unreadEmails = 0;

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
            console.log("err", err);
            if (err)
              return res.status(500).json({ message: "Something went wrong" });
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

        let fetchQuery;
        const emailsPerPage = 50;
        totalEmails = box?.messages?.total;
        if (totalEmails > emailsPerPage) {
          const start = totalEmails - (page - 1) * emailsPerPage;
          const end = start - emailsPerPage;
          fetchQuery = `${start}:${end}`;
        } else {
          fetchQuery = "1:*";
        }
        if (err)
          return res.status(500).json({ message: "Something went wrong" });
        const f = imap.seq.fetch(fetchQuery, {
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
          if (err)
            return res.status(500).json({ message: "Something went wrong" });
          imap.search(["UNSEEN"], function (err, results) {
            if (results.length === 0) return;
            unreadEmails = results.length;
            if (err)
              return res.status(500).json({ message: "Something went wrong" });
            var f = imap.fetch(results, { bodies: "" });
            f.once("error", function (err) {
              console.log("Fetch error");
              return res.status(500).json({ message: "Something went wrong" });
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
    hasError = true;
    res.status(500).send("Error connecting to IMAP server");
  });

  imap.once("end", function () {
    if (totalEmails !== 0)
      if (!hasError) {
        emails.sort(function (a, b) {
          return new Date(b.date) - new Date(a.date);
        });
        res.status(200).json({ emails, unreadEmails, totalEmails });
      }
  });

  imap.connect();
};

const getOneEmail = async (req, res) => {
  const { email } = req.user;

  const { uid, box } = req.body;

  if (!uid || !box) {
    console.log('Missing "uid" or "box"');
    return res.status(400).json({ message: "Missing uid or box" });
  }

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
          if (err)
            return res.status(404).json({ message: "Something went wrong" });
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
                  date,
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
                  date,
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
    // Sanity check
    if (message === {}) {
      return res.status(404).json({ message: "Email not found" });
    }

    if (message.html) {
      const clean = sanitizeHtml(message.html, {
        allowedTags: [
          "html",
          "head",
          "title",
          "body",
          "table",
          "tr",
          "td",
          "th",
          "tbody",
          "thead",
          "tfoot",
          "a",
          "div",
          "img",
          "ul",
          "li",
          "ol",
          "p",
          "br",
          "span",
          "b",
          "i",
          "u",
          "strong",
          "em",
          "blockquote",
          "q",
          "cite",
          "hr",
          "sub",
          "sup",
          "center",
          "font",
          "head",
          "header",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "style",
        ],
        allowVulnerableTags: ["style"],
        allowedAttributes: {
          "*": [
            "style",
            "class",
            "alt",
            "center",
            "bgcolor",
            "align",
            "width",
            "height",
            "border",
            "cellpadding",
            "cellspacing",
            "valign",
            "colspan",
            "rowspan",
            "nowrap",
            "role",
            "data-*",
          ],
          a: ["href", "name", "target"],
          img: ["src", "alt", "width", "height"],
          table: ["bgcolor", "cellpadding", "cellspacing", "border"],
          td: [
            "valign",
            "align",
            "bgcolor",
            "width",
            "height",
            "colspan",
            "rowspan",
            "nowrap",
          ],
          th: [
            "valign",
            "align",
            "bgcolor",
            "width",
            "height",
            "colspan",
            "rowspan",
            "nowrap",
          ],
          tr: ["valign", "align", "bgcolor", "height"],
          font: ["color", "face", "size"],
          b: [],
          i: [],
          u: [],
          strong: [],
          em: [],
        },
      });

      message.html = clean;
    }

    res.status(200).json({ message });
    console.log("Connection ended");
  });

  imap.connect();
};

async function isEmailValid(email) {
  return emailValidator.validate(email).valid;
}

const send = async (req, res, next) => {
  const { to, subject, body, attachments, replyTo, inReplyTo } = req.body;
  const { email } = req.user;

  const password = await getAppPassword(email);

  const user = await User.findOne({ email });

  const name = user.name;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
      pass: password,
    },
  });
  // Check if the to emails are valid
  to.forEach((email) => {
    if (!isEmailValid(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
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

  await transporter.sendMail(info, (err, info) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Something went wrong" });
    } else {
      res.status(200).json({ message: "Email sent" });
    }
  });
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

app.post("/get", getEmails);

app.post("/get-one", getOneEmail);

app.post("/send", send);

app.post("/set-flag", setFlag);

module.exports = app;
