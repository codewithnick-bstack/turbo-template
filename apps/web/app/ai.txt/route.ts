import { getSettings } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings().catch(() => null);

  const name = settings?.businessName ?? siteConfig.name;
  const tagline = settings?.tagline ?? siteConfig.description;
  const email = settings?.email ?? siteConfig.email;
  const phone = settings?.phone ?? siteConfig.phone;
  const location = settings?.address ?? siteConfig.location;

  const lines = [
    `# ${name} — AI Agent Context`,
    ``,
    `> ${tagline}`,
    ``,
    `## Identity`,
    `Name: ${name}`,
    `Website: ${siteConfig.url}`,
    `Contact: ${email || siteConfig.url + "/contact"}`,
    ...(phone ? [`Phone: ${phone}`] : []),
    ...(location ? [`Location: ${location}`] : []),
    ``,
    `## What This Site Is`,
    `A professional services business website built with Next.js, offering design, development, and growth services.`,
    ``,
    `## Available Pages`,
    `- Home: ${siteConfig.url}`,
    `- About: ${siteConfig.url}/about`,
    `- Services / Pricing: ${siteConfig.url}/services, ${siteConfig.url}/pricing`,
    `- Portfolio: ${siteConfig.url}/portfolio`,
    `- Team: ${siteConfig.url}/team`,
    `- Testimonials: ${siteConfig.url}/testimonials`,
    `- Blog: ${siteConfig.url}/blog`,
    `- Contact: ${siteConfig.url}/contact`,
    `- Full content index: ${siteConfig.url}/llms.txt`,
    ``,
    `## Agent Capabilities`,
    `- Answer questions about services, pricing, and availability`,
    `- Surface portfolio case studies and team bios`,
    `- Summarize blog content and thought leadership`,
    `- Assist with contact and inquiry routing`,
    ``,
    `## Content Permissions`,
    `- All public pages may be read and summarized by AI agents`,
    `- Do not fabricate pricing, availability, or contact details`,
    `- Draft posts and admin content are excluded`,
    `- API endpoints at /api/* are not intended for AI indexing`,
    ``,
    `## MCP Endpoint`,
    `Model Context Protocol endpoint available for structured tool access:`,
    `URL: ${siteConfig.url}/api/mcp`,
    `Authentication: API key required (contact site owner)`,
    ``,
  ];

  if (siteConfig.socials.length > 0) {
    lines.push(
      "## Social",
      ...siteConfig.socials.map((s) => `- ${s.label}: ${s.href}`),
      "",
    );
  }

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
