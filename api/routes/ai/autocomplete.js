const express = require("express");
const openai = require("../middlewares/openai");

const app = express();

const send = async (req, res, next) => {
  try {
    let { content } = req.body;

    // Autocomplete the body of this email prompt

    const prompt =
      `Autocomplete the following email body based on the content:\n###\n` +
      `EMAIL BODY: Dear Mom,\n\n` +
      `On this special day, I want to take a moment to wish you a very happy birthday! You have always been such an incredible mother to me and I am so grateful for all of the love and support that you have given me throughout my life.\n\n` +
      `I hope that your birthday is full of joy and celebration. I know that you deserve nothing less! I am so proud to be your daughter and I want to thank you for always being there for me.\n\n` +
      `I hope that you have a wonderful day, surro\n\n` +
      `AUTOCOMPLETION:\nunded by friends and family who love you.\nWith all my love, \n\n` +
      `[Your Name]\n###\n` +
      `EMAIL BODY: ${content}\n\n` +
      `AUTOCOMPLETION:\n`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.4,
      max_tokens: 100,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ["###", "AUTOCOMPLETION:", "AUTOCOMPLETION: ", "<|endoftext|>"],
    });

    let output = `${response.data.choices[0].text}`;

    req.ai.output = output;

    next();
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      success: false,
    });
  }
};

app.post("/email/autocomplete", send);

module.exports = app;
