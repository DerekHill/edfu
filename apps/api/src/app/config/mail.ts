import { createTransport, SentMessageInfo } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

let t;

if (process.env.MAILGUN_SMTP_LOGIN && process.env.MAILGUN_SMTP_PASSWORD) {
  t = createTransport({
    service: 'Mailgun',
    auth: {
      user: process.env.MAILGUN_SMTP_LOGIN,
      pass: process.env.MAILGUN_SMTP_PASSWORD
    }
  });
} else if (process.env.SENDGRID_USERNAME && process.env.SENDGRID_PASSWORD) {
  t = createTransport({
    service: 'SendGrid',
    auth: {
      user: process.env.SENDGRID_USERNAME,
      pass: process.env.SENDGRID_PASSWORD
    }
  });
} else if (
  process.env.MAILTRAP_SMTP_USERNAME &&
  process.env.MAILTRAP_SMTP_PASSWORD
) {
  t = createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_SMTP_USERNAME,
      pass: process.env.MAILTRAP_SMTP_PASSWORD
    }
  });
} else {
  t = {
    sendMail: (
      mailOptions: Mail.Options,
      callback?: (err: Error | null, info: SentMessageInfo) => void
    ) => {
      if (callback) {
        callback(null, '');
      }

      return new Promise(resolve => {
        resolve();
      });
    }
  };
}

export const transporter = t;
