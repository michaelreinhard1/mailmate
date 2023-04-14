# MailMate: AI-Powered Email Client

[![MailMate](app/public/mailmate_Full_Logo.png)](https://mailmate.michaelreinhard.be/)

**Table of Contents**

1.  [Introduction](#introduction)
2.  [Local installation](#local-installation)
3.  [Usage](#usage)
4.  [Troubleshooting and Support](#troubleshooting-and-support)
5.  [Licensing](#licensing)

## Introduction

MailMate is an AI-powered email client developed as a thesis project for the final year of web development studies. The application is built using Node.js, Vue 3, and Tauri, and is hosted at <https://mailmate.michaelreinhard.be/>. It includes several AI features such as subject generation, autocompletion, smart writing, and grammar checking.

It's easy to use, fast, and efficient, allowing you to focus on what matters most - your inbox. With its compatibility with Google app password and node imap, MailMate ensures that your email is safe and secure. Say goodbye to email overload and hello to MailMate.

## Local installation

To set up and run the MailMate application, follow these steps:

1.  Clone the repository:

<!---->

    git clone https://github.com/michaelreinhard1/mailmate.git

2.  Navigate to the project folder:

<!---->

    cd mailmate/app

3.  Install the required dependencies:

<!---->

    npm install

4.  Create a `.env` file in the root directory

<!---->

    cp .env.example .env

5.  Run the application in development mode:

<!---->

    npm run serve

6.  Open the application in your web browser at <http://localhost:3000>.

## Usage

To use the MailMate application, you must first sign in with your Gmail account. Once logged in, you can access the various AI features:

- **Subject Generation**: Automatically generate email subject lines based on the content of your email.
- **Auto-Completion**: Suggests words and phrases, helping you write faster and with fewer errors.
- **Smart Writing**: Composes an entire email for you. By selecting a tone and providing instructions, you can leave the task of writing to smartWrite, which will generate a high-quality email that meets your needs.
- **Spell/grammar correction** - Checks your spelling and grammar, ensuring that your emails are professional and error-free.
- **Attachment detection** - Alerts you when you forget to attach a file to your email, preventing you from sending an incomplete message.
- **smartWrite** - composes an entire email for you. By selecting a tone and providing instructions, you can leave the task of writing to smartWrite, which will generate a high-quality email that meets your needs.

## Troubleshooting and Support

If you encounter any issues or errors while using the MailMate application, please contact me at <michael.reinhard.91@gmail.com>.

## Author

[@michaelreinhard1](https://github.com/michaelreinhard1)
