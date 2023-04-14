const express = require("express");
const openai = require("../middlewares/openai");

const app = express();

const send = async (req, res, next) => {
  try {
    let { content } = req.body;

    const prompt = `Based on the following email, should an attachment be included? Only answer with 'Yes' or 'No'\n ${content} `;

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    let output = `${response.data.choices[0].message.content}`;

    req.ai.output = output;

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
};

app.post("/email/attachment-detection", send);

module.exports = app;
