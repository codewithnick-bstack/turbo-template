import nodemailer from "nodemailer";
import { Resend } from "resend";

import { env } from "../env";

type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  message: string;
};

export async function deliverContactEmail(payload: ContactPayload) {
  const to = env.CONTACT_TO_EMAIL ?? env.CONTACT_FROM_EMAIL;
  const from = env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";
  const subject = `New website inquiry from ${payload.name}`;
  const html = `
    <h2>New client inquiry</h2>
    <p><strong>Name:</strong> ${payload.name}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Company:</strong> ${payload.company || "N/A"}</p>
    <p><strong>Message:</strong></p>
    <p>${payload.message}</p>
  `;

  if (env.RESEND_API_KEY && to) {
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({ from, to, subject, html, replyTo: payload.email });
    return { mode: "resend" as const };
  }

  const transporter = env.SMTP_HOST
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      })
    : nodemailer.createTransport({ jsonTransport: true });

  const info = await transporter.sendMail({
    to: to ?? payload.email,
    from,
    subject,
    html,
    replyTo: payload.email,
  });

  console.log("contact delivery info", info.messageId ?? info.response ?? "log-only");

  return { mode: env.SMTP_HOST ? ("smtp" as const) : ("log-only" as const) };
}
