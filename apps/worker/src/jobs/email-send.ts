import { Worker, type Job } from "bullmq";
import { connection } from "../queues";

export type EmailSendJob = {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: Record<string, string>;
};

export const emailSendWorker = new Worker<EmailSendJob>(
  "email",
  async (job: Job<EmailSendJob>) => {
    const { to, from, subject, html, text, replyTo, tags } = job.data;

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.log("[email-send] RESEND_API_KEY not set, dry-run", { to, subject });
      return { mode: "dry-run", to, subject };
    }

    const recipients = Array.isArray(to) ? to : [to];

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${resendApiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: from ?? (process.env.EMAIL_FROM ?? "noreply@example.com"),
        to: recipients,
        subject,
        html,
        ...(text ? { text } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(tags ? { tags: Object.entries(tags).map(([name, value]) => ({ name, value })) } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend API error ${res.status}: ${body}`);
    }

    const data = await res.json() as { id: string };
    return { emailId: data.id, to: recipients, subject };
  },
  {
    connection,
    concurrency: 5,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    },
  },
);

emailSendWorker.on("failed", (job, err) => {
  console.error("[email-send] job failed", { jobId: job?.id, error: err.message });
});
