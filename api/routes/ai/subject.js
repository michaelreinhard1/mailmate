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

    const prompt = `Compose an email subject line that is between 6-8 words long, uses active verbs to convey a sense of urgency, and accurately reflects the email content, such as highlighting the main benefit or call to action. Follow these guidelines:\n\n

    1. Use specific and descriptive language to capture the recipient's attention, such as action verbs or clear value propositions.\n

    2. Keep the subject line short and to-the-point, focusing on the most important message.\n

    3. Avoid using misleading or spammy language that could harm the sender's reputation or lead to lower open rates.\n

    4. Consider personalizing the subject line with the recipient's name or company to increase relevance.\n

    5. Revise and test the subject line before sending the email to ensure it is effective and engaging.\n

    6. Write the subject line in the same language as the email body.\n\n

    EMAIL CONTENT:\n

    ${content}
    \n
    SUBJECT LINE:

   `;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 50,
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
