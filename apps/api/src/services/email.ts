import { env } from "../env";

type ContactRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  createdAt: Date;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function sendContactNotification(contact: ContactRow, toEmail: string) {
  if (!env.RESEND_API_KEY) {
    console.log("[email] RESEND_API_KEY not set — skipping notification for contact", contact.id);
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: toEmail,
        subject: `New contact: ${escapeHtml(contact.subject ?? contact.name)}`,
        html: `
          <h2>New Contact Submission</h2>
          <p><strong>From:</strong> ${escapeHtml(contact.name)} (${escapeHtml(contact.email)})</p>
          ${contact.phone ? `<p><strong>Phone:</strong> ${escapeHtml(contact.phone)}</p>` : ""}
          ${contact.subject ? `<p><strong>Subject:</strong> ${escapeHtml(contact.subject)}</p>` : ""}
          <p><strong>Message:</strong></p>
          <blockquote style="white-space:pre-wrap">${escapeHtml(contact.message)}</blockquote>
          <hr>
          <p style="color:#888;font-size:12px">Received at ${contact.createdAt.toISOString()}</p>
        `,
      }),
    });

    if (!res.ok) {
      console.error("[email] Resend error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[email] Failed to send notification:", err);
  }
}
