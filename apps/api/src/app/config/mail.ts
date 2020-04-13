import { createTransport, SentMessageInfo } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

let t;

if (
  process.env.MAILGUN_SMTP_SERVER &&
  process.env.MAILGUN_SMTP_PORT &&
  process.env.MAILGUN_SMTP_LOGIN &&
  process.env.MAILGUN_SMTP_PASSWORD
) {
  const options = {
    host: process.env.MAILGUN_SMTP_SERVER,
    port: process.env.MAILGUN_SMTP_PORT,
    auth: {
      user: process.env.MAILGUN_SMTP_LOGIN,
      pass: process.env.MAILGUN_SMTP_PASSWORD
    }
  };
  // @ts-ignore. Host and port should be in the typings https://nodemailer.com/smtp/#examples
  t = createTransport(options);
  console.log('Created Mailgun transport');
} else if (process.env.SENDGRID_USERNAME && process.env.SENDGRID_PASSWORD) {
  t = createTransport({
    service: 'SendGrid',
    auth: {
      user: process.env.SENDGRID_USERNAME,
      pass: process.env.SENDGRID_PASSWORD
    }
  });
  console.log('Created Sendgrid transport');
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
  console.log('Created Mailtrap transport');
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
  console.log('Created null transport');
}

export const transporter = t;
