const express = require("express");
const openai = require("../middlewares/openai");

const app = express();

const send = async (req, res, next) => {
  try {
    const { content } = req.body;

    const prompt = `Generate a concise and attention-grabbing subject line for the following email:
    
    ${content}

    The subject line should summarize the main message of the email in the same language as the email body.
        
    SUBJECT LINE:
    `;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 50,
      temperature: 0,
      // Remove spaces before output
      stop: ["###", "SUBJECT LINE:", "SUBJECT LINE: "],
    });

    let output = `${response.data.choices[0].text}`;

    output = output.replace(/^\s+|"+$|\n$/, "");

    req.ai.output = output;

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
};

app.post("/email/subject", send);

module.exports = app;
