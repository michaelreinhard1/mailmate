const express = require("express");
const openai = require("../middlewares/openai");

const app = express();

const send = async (req, res, next) => {
  try {
    let { content } = req.body;

    // Autocomplete the body of this email prompt

    const prompt =
      `Autocomplete the following email body based on the content:\n###\n` +
      `EMAIL BODY: Dear Josh,\n\n` +
      `I am pleased to share with you our proposal for marketing services that we believe will help your business grow and reach new heights.\n\n` +
      `As we discussed in our previous meetings, our team has developed a comprehensive strategy that will ensure your brand is seen by the right audience, at the right time, and in the right place. We have outlined our approach, services, and pricing in the attached PDF document.\n\n` +
      `Please find attached our proposal for marketing services. We believe this docume\n\n` +
      `AUTOCOMPLETION:\nnt will give you a better understanding of how we can help your business and the value we can provide.\n\nThank you for considering our proposal, and we look forward to working with you.\n\n` +
      `Best regards,\n\n` +
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

    console.log(output);

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
