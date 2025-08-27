import nodemailer from "nodemailer";
import { verfiyAccountTemplate, resetPasswordTemplate } from "./templates.js";

export default async function sendEmail(URL, email, verfiy = true) {
  // Create a test account or replace with real credentials.
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: '"Group4" <itiGroup4@gmail.com>',
    to: email,
    subject: verfiy ? "Hello ✔" : "Reset Your Password", // Subject line
    text: verfiy
      ? "Hello world?"
      : "Your password reset token (valid for 10 min)", // plain‑text body
    html: verfiy ? verfiyAccountTemplate(URL) : resetPasswordTemplate(URL), // HTML body
  });

  console.log("Message sent:", info.messageId);
}
