import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { ApiError } from "./ApiError.js";

const sendEmail = async (input) => {

  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: process.env.APP_NAME,
      link: process.env.MAIL_LINK
    }
  });

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: Number(process.env.MAILTRAP_SMTP_PORT),
    secure: process.env.MAILTRAP_SMTP_SECURE === 'true',
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS
    }
  });

  const emailHTML = mailGenerator.generate(input.mailgenContent);
  const emailText = mailGenerator.generatePlaintext(input.mailgenContent);
  const mail = {
    from: process.env.MAIL_SENDER,
    to: input.email,
    subject: input.subject,
    text: emailText,
    html: emailHTML
  };
  try {
    // await transporter.sendMail(mail);
    console.log(`[Mock Mailer] Email "sent" to ${input.email} | Subject: ${input.subject} | ${input.mailgenContent}`);
  } catch (error) {
    throw new ApiError(400, "Email could not be send", error);
  }
};

const emailVerificationMailgen = (verificationUrl, otpNumber) => {
  const appName = process.env.APP_NAME;
  return {
    body: {
      intro: `Welcome to ${appName}! We're very excited to have you on board.`,
      action: {
        instructions: `Either click on the link to verify your email or enter the OTP: <span style="color: #ff5733; font-size: 28px; font-weight: bold;">${otpNumber}</span>`,
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: verificationUrl
        }
      },
      outro: 'This is a system-generated email. Do not reply to this!'
    }
  };
};

const forgetPasswordMailgen = (verificationUrl) => {
  const appName = process.env.APP_NAME;
  return {
    body: {
      intro: `Welcome to ${appName}! We're very excited to have you on board.`,
      action: {
        instructions: `Click on the link to reset your password of the ${appName} `,
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: verificationUrl
        }
      },
      outro: 'This is a system-generated email. Do not reply to this!'
    }
  };
};



export { sendEmail, emailVerificationMailgen, forgetPasswordMailgen };
export default { sendEmail, emailVerificationMailgen, forgetPasswordMailgen };

// ref: https://nodemailer.com/
