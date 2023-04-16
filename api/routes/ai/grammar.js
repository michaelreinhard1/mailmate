const express = require("express");
const openai = require("../middlewares/openai");

const app = express();

const send = async (req, res, next) => {
  try {
    const { content } = req.body;
    console.log(content);

    const response = await openai.createEdit({
      model: "text-davinci-edit-001",
      instruction: `Revise the grammar and spelling in the provided HTML text without altering the existing formatting. In the same language as the input.`,
      input: content,
    });

    let output = `${response.data.choices[0].text}`;

    output = output.replace(/^[ \t\r\n]+/, "");

    console.log(output);

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
