import { JSXElementConstructor, ReactElement } from "react";

import nodemailer, { Transporter } from "nodemailer";

/**
 * [self-host] SMTP transport for `sendEmail`.
 *
 * Papermark sends everything through Resend, which is fine for the hosted
 * product but means a self-hosted instance cannot send its own login codes —
 * and since the default sign-in flow is a magic code by email, that makes the
 * instance unusable without a Resend account and a verified sending domain.
 *
 * Set SMTP_HOST (plus the usual friends) and every transactional email goes out
 * over your own SMTP server instead. Resend still wins if RESEND_API_KEY is set.
 */

export const isSmtpConfigured = () => !!process.env.SMTP_HOST;

let transporter: Transporter | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const port = Number(process.env.SMTP_PORT || 587);

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // Implicit TLS on 465, STARTTLS everywhere else.
    secure:
      process.env.SMTP_SECURE === "true" ||
      (process.env.SMTP_SECURE !== "false" && port === 465),
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
    tls: {
      // Home-lab mail servers routinely use self-signed certificates.
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== "false",
    },
  });

  return transporter;
};

export const sendEmailWithSmtp = async ({
  to,
  subject,
  html,
  text,
  from,
  cc,
  replyTo,
  unsubscribeUrl,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  cc?: string | string[];
  replyTo?: string;
  unsubscribeUrl?: string;
}) => {
  const fromAddress =
    process.env.SMTP_FROM || from || "Papermark <papermark@localhost>";

  const info = await getTransporter().sendMail({
    from: fromAddress,
    to,
    cc,
    replyTo,
    subject,
    html,
    text,
    ...(unsubscribeUrl
      ? {
          headers: {
            "List-Unsubscribe": `<${unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        }
      : {}),
  });

  return { id: info.messageId };
};

export type EmailReact = ReactElement<any, string | JSXElementConstructor<any>>;
