import nodemailer from 'nodemailer';
import logger from '../../utils/logger.js';

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false, // Use true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmailAction(config) {
  const { to, subject, body } = config;
  if (!to || !subject || !body) {
    throw new Error('Email action requires "to", "subject", and "body" in config.');
  }

  await transport.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text: body,
  });

  logger.info(`Email sent successfully to ${to}`);
  return { success: true, message: `Email sent to ${to}` };
}
