export default function SdkPage() {
  return (
    <article>
      <h1>TypeScript SDK</h1>
      <p>
        <code>@repo/sdk</code> is a typed fetch wrapper covering all platform endpoints.
        Zero dependencies beyond the Fetch API.
      </p>

      <h2>Installation (workspace)</h2>
      <Pre>{`import { PlatformClient } from "@repo/sdk";`}</Pre>

      <h2>Initialise</h2>
      <Pre>{`const client = new PlatformClient({
  baseUrl: process.env.PLATFORM_API_URL,
  apiKey: process.env.PLATFORM_API_KEY, // → Authorization: Bearer ...
});`}</Pre>

      <h2>Namespaces</h2>
      <Pre>{`// Sites
await client.sites.list();
await client.sites.create({ name: "My Site", slug: "my-site" });

// Pages
await client.pages.list(siteId);
await client.pages.publish(pageId);

// Blog
await client.blog.createPost({ siteId, title: "Hello", slug: "hello", content: "" });
await client.blog.publishPost(postId);

// Analytics
await client.analytics.get(siteId, 30);

// AI
await client.aiAssistant.chat(siteId, [{ role: "user", content: "What pages do I have?" }]);
await client.aiAssistant.generateBlogPost({ title: "…", outline: "…" });
await client.aiAssistant.seoAudit(pageId);

// Members
await client.members.invite("colleague@example.com", "editor");
await client.members.list();

// Templates
await client.templates.list();
await client.templates.use(templateId, { name: "New Site", slug: "new-site" });

// Branding
await client.branding.update({ primaryColor: "#4f46e5", logoUrl: "https://…" });`}</Pre>

      <h2>Error handling</h2>
      <Pre>{`try {
  await client.pages.publish(id);
} catch (err) {
  // err.message includes HTTP status and body
  console.error(err.message);
}`}</Pre>
    </article>
  );
}

function Pre({ children }: { children: string }) {
  return <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: 16, borderRadius: 8, fontSize: 13, overflowX: "auto", margin: "12px 0" }}><code>{children}</code></pre>;
}
