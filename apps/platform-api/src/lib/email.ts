const RESEND_API = "https://api.resend.com/emails";

export async function sendInviteEmail(opts: {
  to: string;
  role: string;
  token: string;
  adminOrigin: string;
  resendApiKey?: string;
}) {
  if (!opts.resendApiKey) return; // no-op when Resend not configured

  const acceptUrl = `${opts.adminOrigin}/invite/accept?token=${opts.token}`;

  await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${opts.resendApiKey}`,
    },
    body: JSON.stringify({
      from: "noreply@platform.dev",
      to: opts.to,
      subject: `You've been invited as ${opts.role}`,
      html: `
        <p>You have been invited to join as <strong>${opts.role}</strong>.</p>
        <p><a href="${acceptUrl}">Accept invitation</a></p>
        <p>This link expires in 7 days.</p>
        <p>If you did not expect this invite, you can ignore this email.</p>
      `,
    }),
  });
}
