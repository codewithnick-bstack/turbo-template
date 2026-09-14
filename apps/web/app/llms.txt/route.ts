import { getBlogPosts, getSettings } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, posts] = await Promise.all([
    getSettings().catch(() => null),
    getBlogPosts().catch(() => []),
  ]);

  const name = settings?.businessName ?? siteConfig.name;
  const tagline = settings?.tagline ?? siteConfig.description;
  const email = settings?.email ?? siteConfig.email;
  const publishedPosts = posts.filter((p) => p.status === "published");

  const lines = [
    `# ${name}`,
    ``,
    `> ${tagline}`,
    ``,
    `## About`,
    `${name} is a professional services business. Contact us at ${email || siteConfig.url}.`,
    ``,
    `## Pages`,
    `- Home: ${siteConfig.url}`,
    `- About: ${siteConfig.url}/about`,
    `- Services: ${siteConfig.url}/services`,
    `- Pricing: ${siteConfig.url}/pricing`,
    `- Portfolio: ${siteConfig.url}/portfolio`,
    `- Team: ${siteConfig.url}/team`,
    `- Testimonials: ${siteConfig.url}/testimonials`,
    `- Blog: ${siteConfig.url}/blog`,
    `- Contact: ${siteConfig.url}/contact`,
    ``,
    `## AI Indexing`,
    `- All public pages are indexable by AI crawlers`,
    `- robots.txt explicitly permits GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, CCBot, Bingbot, PetalBot`,
    `- Draft and admin content is excluded`,
    `- API endpoints at /api/* are not indexed`,
    ``,
    `## Structured Data`,
    `- Organization: ProfessionalService (JSON-LD on every page)`,
    `- Blog posts: BlogPosting schema with headline, author, datePublished`,
    `- Services: Service+Offer schema with pricing on /pricing`,
    ``,
  ];

  if (publishedPosts.length > 0) {
    lines.push(`## Blog Posts (${publishedPosts.length} total)`);
    for (const post of publishedPosts) {
      lines.push(`- [${post.title}](${siteConfig.url}/blog/${post.slug})`);
      if (post.excerpt) lines.push(`  ${post.excerpt}`);
    }
    lines.push("");
  }

  const capabilities = [
    "Professional website design and development",
    "SEO and growth services",
    "Portfolio and case study presentation",
    "Contact form and inquiry handling",
  ];
  if (publishedPosts.length > 0) capabilities.push("Blog and thought leadership content");

  const phone = settings?.phone ?? siteConfig.phone;
  const location = settings?.address ?? siteConfig.location;

  lines.push(
    "## Capabilities",
    ...capabilities.map((c) => `- ${c}`),
    "",
    `## Contact`,
    `Email: ${email || "(see contact page)"}`,
    ...(phone ? [`Phone: ${phone}`] : []),
    ...(location ? [`Location: ${location}`] : []),
    `Website: ${siteConfig.url}/contact`,
  );

  if (siteConfig.socials.length > 0) {
    lines.push(
      "",
      "## Social",
      ...siteConfig.socials.map((s) => `- ${s.label}: ${s.href}`),
    );
  }

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
