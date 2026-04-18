export type DeliveryTarget = {
  emails: string[];
  webhookUrl?: string | null;
};

export type FormSubmissionData = {
  formName: string;
  submissionId: string;
  data: Record<string, unknown>;
  submittedAt: Date;
};

export async function deliverFormSubmission(
  target: DeliveryTarget,
  submission: FormSubmissionData,
): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (target.emails.length > 0) {
    tasks.push(sendEmail(target.emails, submission));
  }

  if (target.webhookUrl) {
    tasks.push(deliverWebhook(target.webhookUrl, submission));
  }

  await Promise.allSettled(tasks);
}

async function sendEmail(to: string[], submission: FormSubmissionData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@platform.example.com";
  if (!apiKey) return;

  const html = `
    <h2>New submission: ${submission.formName}</h2>
    <p>Received: ${submission.submittedAt.toISOString()}</p>
    <table>
      ${Object.entries(submission.data)
        .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${String(v)}</td></tr>`)
        .join("")}
    </table>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: `New form submission: ${submission.formName}`,
      html,
    }),
  });
}

async function deliverWebhook(url: string, submission: FormSubmissionData): Promise<void> {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "form.submitted", data: submission }),
  });
}
