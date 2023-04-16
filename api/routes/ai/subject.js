const express = require("express");
const openai = require("../middlewares/openai");

const app = express();

const send = async (req, res, next) => {
  try {
    const { content } = req.body;

    // const prompt = `Generate a concise and attention-grabbing subject line for the following email:

    // ${content}

    // The subject line should summarize the main message of the email in the same language as the email body.

    // SUBJECT LINE:
    // `;

    const prompt = `Compose a concise email subject line that is between 6-8 words long that accurately reflects the email content, such as highlighting the main benefit or call to action. It needs to be in the same language as the email body\n\n
    
    EMAIL BODY:
    ${content}\n\n
    SUBJECT LINE:

   `;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
      // Remove spaces before output
      stop: ["###", "SUBJECT LINE:", "SUBJECT LINE: "],
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

app.post("/email/subject", send);

module.exports = app;
