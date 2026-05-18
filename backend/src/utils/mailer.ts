// backend/utils/mailer.ts
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTP(email: string, code: string) {
  try {
    const info = await transporter.sendMail({
      from: `"ICT Library System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your 2FA Verification Code",
      html: `
        <h2>Two-Factor Authentication</h2>
        <p>Your verification code is:</p>
        <h1>${code}</h1>
        <p>This code will expire in 5 minutes.</p>
      `,
    });

    console.log("EMAIL SENT:", info.messageId);
  } catch (err) {
    console.error("EMAIL FAILED:", err);
  }
}