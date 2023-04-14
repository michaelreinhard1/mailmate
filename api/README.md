# MailMate: Backend

**Table of Contents**

1.  [Introduction](#introduction)
2.  [Installation](#installation)
3.  [Endpoints and Routes](#endpoints-and-routes)
4.  [Database Schema and Models](#database-schema-and-models)
5.  [Third-Party APIs and Libraries](#third-party-apis-and-libraries)
6.  [Usage Scenarios and Code Snippets](#usage-scenarios-and-code-snippets)
7.  [Additional Information](#additional-information)

## Introduction

This contains the backend code for an MailMate. The backend is built using Node.js and incorporates MongoDB, Node IMAP, Nodemailer, OpenAI API, and JSON Web Tokens. The aim of this api is to provide the necessary functionality for the MailMate application.

## Installation

To install and run the backend code, follow these steps:

1.  Clone the repository:

<!---->

    git clone https://github.com/michaelreinhard1/mailmate.git

2.  Navigate to the project folder:

<!---->

    cd mailmate/api

3.  Install the required dependencies:

<!---->

    npm install

4.  Create a `.env` file in the root directory

<!---->

    cp .env.example .env

5.  Run the backend server:

<!---->

    npm start

## Endpoints and Routes

The backend code includes the following endpoints and routes:

- **api/auth/signin** (POST): Authenticate a user with Google OAuth and generate a JWT token.

  - Output: `{ "token": "<jwt_token>", "profile": <user_object> }`

- **api/email/get** (GET): Retrieve a list of emails for the authenticated user.

  - Required parameter: `Authorization` header with JWT token.
  - Output: `{ "emails": [Array of email objects] }`

- **api/email/get-one** (GET): Retrieve a single email by ID for the authenticated user.

  - Required parameter: `Authorization` header with JWT token.
  - Output: `{ "email": <email_object> }`

- **api/email/send** (POST): Send an email using the authenticated user's email address.

  - Required parameter: `Authorization` header with JWT token.
  - Input: `{ "to": "[Array of email addresses]", "subject": "<subject>", "body": "<email_body>" }`
  - Output: `{ "message": "Email sent" }`

There are other endpoints and routes like **api/ai/subject**, **api/ai/autocomplete**, **api/ai/body**, **api/ai/grammar**, etc. that are used to implement the AI features.

## Database Schema and Models

The backend uses MongoDB as its database, with the following schema and model:

- **User**: Stores user information, such as email address and Google App password.

  - Fields: `googleId`, `email`, `picture`, `fname`, `lname`, `name`, `created`, `appPassword`

## Third-Party APIs and Libraries

The backend code includes the following third-party APIs and libraries:

- **Node IMAP**: Fetches emails from an IMAP server.
- **Nodemailer**: Sends emails using SMTP.
- **OpenAI API**: Provides AI features such as subject generation, auto-completion, smart writing, and grammar checking.
- **JWT tokens**: Implements user authentication and authorization.
- **Google OAuth**: Authenticates users with Google OAuth.
- **MongoDB**: Stores user information.
- **Mongoose**: Provides a schema-based solution to model application data.

## Usage Scenarios and Code Snippets

Here are some examples of how the various components of the backend code work together:

### Fetching emails

```javascript
const imap = require("node-imap");

const getEmails = async (req, res) => {

  const { email } = req.user;

  const { page, box } = req.body; // ex. page = 1, box = "INBOX"

   const imap = new Imap({
    user: email, // john.doe@gmail.com
    password: password, // mmfgqchxnxbkpoyx
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });

  // Fetch emails using node-imap...
```

### Sending an email

```javascript
const nodemailer = require("nodemailer");

const send = async (req, res, next) => {
  const { to, subject, body, attachments, replyTo, inReplyTo } = req.body;

  const { email } = req.user;

  const password = await getAppPassword(email);

  const user = await User.findOne({ email });

  const name = user.name;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email, // john.doe@gmail.com
      pass: password, // mmfgqchxnxbkpoyx
    },
  });

  const info = {
    from: `${name} <${email}>`, // ex. "John Doe <john.doe@gmail.com>"
    to, // ex. ["test@gmail.com", "test@gmail.com"]
    subject,
    html: body, // ex. "<p>Hello world!</p>"
    attachments,
    ...(replyTo && { replyTo }),
    ...(inReplyTo && { inReplyTo }),
  };

  const mail = await transporter.sendMail(info, (err, info) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Something went wrong" });
    } else {
      res.status(200).json({ message: "Email sent" });
    }
  });
};
```

## Additional Information

### Future Development Plans

- Implement support for additional email providers and protocols.
- Expand the AI feature set to include sentiment analysis, email categorization, and spam detection, etc.

## Author

[@michaelreinhard1](https://github.com/michaelreinhard1)
