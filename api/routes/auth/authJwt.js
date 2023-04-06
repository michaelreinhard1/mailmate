const db = require("../models");
const jwt = require("jsonwebtoken");
const User = db.user;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        res.status(401).json({ message: "Unauthorized" });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    console.log("No token provided");
    res.sendStatus(403).json();
  }
};

const authJwt = {
  verifyToken,
};
module.exports = authJwt;
