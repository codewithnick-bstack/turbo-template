export default function WebhooksPage() {
  return (
    <article>
      <h1>Webhooks</h1>
      <p>Subscribe to platform events and receive signed HTTP POST payloads.</p>

      <h2>Subscribe</h2>
      <Pre>{`POST /v1/webhooks/subscriptions
{
  "url": "https://your-server.com/webhook",
  "events": ["page.published", "blog.post_published", "form.submitted"]
}`}</Pre>

      <h2>Payload shape</h2>
      <Pre>{`{
  "id": "evt_01j...",
  "event": "page.published",
  "tenantId": "...",
  "occurredAt": "2026-04-18T12:00:00Z",
  "payload": { ... }
}`}</Pre>

      <h2>Signature verification</h2>
      <Pre>{`// Node.js
const crypto = require("crypto");

function verifyWebhook(rawBody, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}`}</Pre>

      <h2>Event catalogue</h2>
      <Table
        headers={["Event", "Trigger"]}
        rows={[
          ["page.published", "Page published"],
          ["page.unpublished", "Page unpublished"],
          ["blog.post_published", "Blog post published"],
          ["blog.post_created", "Blog post created"],
          ["form.submitted", "Form submission received"],
          ["media.uploaded", "Media asset uploaded"],
          ["member.invited", "Team member invited"],
          ["member.removed", "Team member removed"],
          ["site.created_from_template", "Site created from template"],
          ["tenant.upgraded", "Tenant plan upgraded"],
        ]}
      />

      <h2>Replay</h2>
      <Pre>{`POST /v1/webhooks/replay
{ "sinceIsoDate": "2026-04-01T00:00:00Z" }`}</Pre>
    </article>
  );
}

function Pre({ children }: { children: string }) {
  return <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: 16, borderRadius: 8, fontSize: 13, overflowX: "auto", margin: "12px 0" }}><code>{children}</code></pre>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ border: "1px solid #e5e7eb", padding: "8px 12px", background: "#f9fafb", textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={{ border: "1px solid #e5e7eb", padding: "8px 12px" }}><code style={{ fontSize: 12 }}>{cell}</code></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
