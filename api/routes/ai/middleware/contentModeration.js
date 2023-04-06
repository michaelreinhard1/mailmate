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
      console.log("Error in content filtering");
      next();
    } else {
      if (Object.values(results[0].categories).every((x) => x === false)) {
        console.log("Safe content");
        res.json({
          output: req.ai.output,
          safeContent: true,
        });
      } else {
        console.log("Unsafe content");
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
