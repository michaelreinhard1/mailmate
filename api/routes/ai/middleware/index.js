const contentModeration = require("./contentModeration");

const middleware = async (req, res, next) => {
  req.ai = {};
  next();
};

const checks = {
  middleware,
  contentModeration,
};

module.exports = checks;
