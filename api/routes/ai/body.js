const express = require("express");
const openai = require("../middlewares/openai");

const app = express();

const send = async (req, res, next) => {
  try {
    const { content, tonality } = req.body;

    const prompt = `Write an email body with a specific tonality and variable content. You will receive a tonality and the content of the email as input. Your task is to write an email body that matches the given tonality and incorporates the provided content. The tone should be appropriate to the given tonality.\n\n

    Please incorporate the provided content into the email body and write a text that is at least 100 words long. Make sure that the tone matches the given tonality and that the language is professional and appropriate for an email.\n\n

    It needs to be in the same language as the provided content.\n\n

    Input:\n
    - tone: ${tonality}\n
    - content: ${content}\n\n

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
      max_tokens: 350,
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
