const express = require("express");
const openai = require("../middlewares/openai");

const app = express();

const send = async (req, res, next) => {
  try {
    const { content, tonality } = req.body;

    const prompt = `Generate an email body with a specific tonality and variable content. You will receive a tonality and the content of the email as input. Your task is to generate an email body that matches the given tonality and incorporates the provided content. The email should be written in a professional language, and the tone should be appropriate to the given tonality.

    Please incorporate the provided content into the email body and generate a text that is at least 100 words long. Make sure that the tone matches the given tonality and that the language is professional and appropriate for an email.

    Input:
    - tone: ${tonality}
    - content: ${content}

    Output:
    - email body: a text that matches the given tonality and incorporates the provided content, and is at least 100 words long.

    ###
    EMAIL BODY:
    `;

    let temp;

    switch (tonality) {
      case "neutral":
        temp = 0.5;
        break;
      case "professional":
        temp = 0.3;
        break;
      case "friendly":
        temp = 0.7;
        break;
      case "apologetic":
        temp = 0.5;
        break;
      case "thankful":
        temp = 0.7;
        break;
      case "urgent":
        temp = 0.9;
        break;
      case "formal":
        temp = 0.3;
        break;
      case "humorous":
        temp = 0.9;
        break;
      case "informative":
        temp = 0.5;
        break;
      case "sincere":
        temp = 0.7;
        break;
      case "persuasive":
        temp = 0.9;
        break;
      default:
        temp = 0.3;
    }

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 250,
      temperature: temp,
      stop: ["###", "EMAIL BODY:", "EMAIL BODY: "],
    });

    let output = `${response.data.choices[0].text}`;

    output = output.replace(/^\s+/, "");

    req.ai.output = output;

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
};

app.post("/email/body", send);

module.exports = app;
