import nodemailer from 'nodemailer';
import { env } from '../config/env.config';

let transporter: nodemailer.Transporter;

if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: parseInt(env.SMTP_PORT),
    secure: parseInt(env.SMTP_PORT) === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  console.log('✅ Mailer configured');
} else {
  console.warn('⚠️ SMTP config missing. Emails will be logged to console.');
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    if (!transporter) {
      console.log(`\n[EMAIL SIMULATION] To: ${to}\nSubject: ${subject}\nBody: HTML Content Hidden\n`);
      return;
    }

    const info = await transporter.sendMail({
      from: env.EMAIL_FROM || '"Opportunity Radar" <noreply@opportunityradar.com>',
      to,
      subject,
      html,
    });
    console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};
