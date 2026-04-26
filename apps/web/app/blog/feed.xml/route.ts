import { getBlogPosts, getSettings } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

export const dynamic = "force-dynamic";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [settings, posts] = await Promise.all([
    getSettings().catch(() => null),
    getBlogPosts().catch(() => []),
  ]);

  const siteTitle = settings?.businessName ?? siteConfig.name;
  const siteDescription = settings?.seoDescription ?? siteConfig.description;
  const siteUrl = siteConfig.url;
  const published = posts
    .filter((p) => p.status === "published")
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 20);

  const items = published
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const pubDate = post.createdAt ? new Date(post.createdAt).toUTCString() : new Date().toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>${post.excerpt ? `\n      <description>${escapeXml(post.excerpt)}</description>` : ""}${post.author ? `\n      <author>${escapeXml(post.author)}</author>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
