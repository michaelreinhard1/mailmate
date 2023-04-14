const openai = require("../../middlewares/openai");

const contentModeration = async (req, res, next) => {
  if (req.ai.output) {
    const reponse = await openai
      .createModeration({
        input: req.ai.output,
      })
      .then((response) => {
        return response;
      });
    const results = reponse.data.results;
    if (results[0].error) {
      next();
    } else {
      if (Object.values(results[0].categories).every((x) => x === false)) {
        res.json({
          output: req.ai.output,
          safeContent: true,
        });
      } else {
        res.status(400).json({
          safeContent: false,
        });
      }
    }
  } else {
    next();
  }
};

module.exports = contentModeration;
