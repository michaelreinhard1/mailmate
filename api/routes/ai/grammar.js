const express = require("express");
const openai = require("../middlewares/openai");

const app = express();

const send = async (req, res, next) => {
  try {
    const { content } = req.body;

    const prompt = `${content} `;

    const response = await openai.createEdit({
      model: "text-davinci-edit-001",
      instruction: "Fix the spelling mistakes",
      input: prompt,
    });
    let output = `${response.data.choices[0].text}`;
    req.ai.output = output;
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
};

app.post("/email/grammar", send);

module.exports = app;
