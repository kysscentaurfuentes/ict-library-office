// backend/src/routes/forgotAccount.ts
import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post(
  '/forgot-account',
  async (req, res) => {
    const {
      studentId,
      username,
      email,
    } = req.body;

    try {
      const transporter =
        nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
          },
        });

      await transporter.sendMail({
        from:
          'kysscentaur.fuentes@carsu.edu.ph',

        to:
          'kysscentaur.fuentes@carsu.edu.ph',

        subject:
          'Forgot Account Request',

        html: `
          <h2>Forgot Account Request</h2>

          <p><b>Student ID:</b> ${
            studentId || 'N/A'
          }</p>

          <p><b>Username:</b> ${
            username || 'N/A'
          }</p>

          <p><b>Email:</b> ${
            email
              ? `${email}@carsu.edu.ph`
              : 'N/A'
          }</p>
        `,
      });

      res.json({
        message:
          'Your request has been submitted successfully.',
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        message:
          'Failed to send request.',
      });
    }
  }
);

export default router;