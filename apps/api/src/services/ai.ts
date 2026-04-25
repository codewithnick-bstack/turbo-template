import { sql } from "drizzle-orm";
import type { Db } from "@repo/db";
import { createModelAdapter, chatWithContext, generateBlogDraft, generateMetaDescription, type ChatMessage } from "@repo/ai";
import { env } from "../env";
import * as teamService from "./team";
import * as portfolioService from "./portfolio";
import * as testimonialsService from "./testimonials";

const adapter = createModelAdapter({
  provider: env.AI_PROVIDER,
  ...(env.ANTHROPIC_API_KEY ? { anthropicApiKey: env.ANTHROPIC_API_KEY } : {}),
  ...(env.OPENAI_API_KEY ? { openaiApiKey: env.OPENAI_API_KEY } : {}),
  defaultModel: "claude-haiku-4-5",
});

export async function chatWithSiteContext(db: Db, messages: ChatMessage[]) {
  const lastMessage = messages.at(-1)?.content ?? "";

  const [settingsResult, teamResult, portfolioResult, testimonialsResult, blogFtsResult, blogRecentResult] =
    await Promise.allSettled([
      db.query.siteSettings.findFirst(),
      teamService.listTeamMembers(db, { limit: 20 }),
      portfolioService.listPortfolioEntries(db, { limit: 20 }),
      testimonialsService.listTestimonials(db, { featuredOnly: true, limit: 10 }),
      lastMessage
        ? db.execute(
            sql`SELECT title, excerpt, content FROM blog_posts WHERE status = 'published' AND to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content) @@ plainto_tsquery('english', ${lastMessage.slice(0, 200)}) LIMIT 4`,
          )
        : Promise.resolve(null),
      db.execute(
        sql`SELECT title, excerpt, slug FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC NULLS LAST LIMIT 3`,
      ),
    ]);

  const contextDocs: string[] = [];

  if (settingsResult.status === "fulfilled" && settingsResult.value) {
    const s = settingsResult.value;
    const parts = [`Business: ${s.businessName}`];
    if (s.tagline) parts.push(`Tagline: ${s.tagline}`);
    if (s.email) parts.push(`Email: ${s.email}`);
    if (s.phone) parts.push(`Phone: ${s.phone}`);
    if (s.address) parts.push(`Address: ${s.address}`);
    if (s.seoDescription) parts.push(`About: ${s.seoDescription}`);
    contextDocs.push(parts.join("\n"));
  }

  if (teamResult.status === "fulfilled" && teamResult.value.length > 0) {
    const members = teamResult.value
      .map((m) => `- ${m.name}, ${m.title}${m.bio ? `: ${m.bio.slice(0, 120)}` : ""}`)
      .join("\n");
    contextDocs.push(`Team members:\n${members}`);
  }

  if (portfolioResult.status === "fulfilled" && portfolioResult.value.length > 0) {
    const entries = portfolioResult.value
      .map((e) => {
        const parts = [`- ${e.title}`];
        if (e.client) parts.push(`(client: ${e.client})`);
        if (e.description) parts.push(`— ${e.description.slice(0, 150)}`);
        if (e.tags?.length) parts.push(`[${e.tags.join(", ")}]`);
        return parts.join(" ");
      })
      .join("\n");
    contextDocs.push(`Portfolio work:\n${entries}`);
  }

  if (testimonialsResult.status === "fulfilled" && testimonialsResult.value.length > 0) {
    const quotes = testimonialsResult.value
      .map((t) => `- "${t.quote.slice(0, 150)}" — ${t.authorName}${t.company ? `, ${t.company}` : ""}`)
      .join("\n");
    contextDocs.push(`Client testimonials:\n${quotes}`);
  }

  const ftsRows = blogFtsResult.status === "fulfilled" && blogFtsResult.value
    ? (() => {
        const r = blogFtsResult.value as { rows?: unknown[] } | unknown[];
        return Array.isArray(r) ? r : (r as { rows?: unknown[] }).rows ?? [];
      })()
    : [];

  const recentRows = blogRecentResult.status === "fulfilled"
    ? (() => {
        const r = blogRecentResult.value as { rows?: unknown[] } | unknown[];
        return Array.isArray(r) ? r : (r as { rows?: unknown[] }).rows ?? [];
      })()
    : [];

  const seenTitles = new Set<string>();
  const blogSnippets: string[] = [];

  for (const row of [...ftsRows, ...recentRows] as { title?: unknown; excerpt?: unknown; content?: unknown; slug?: unknown }[]) {
    const title = String(row.title ?? "");
    if (!title || seenTitles.has(title)) continue;
    seenTitles.add(title);
    const excerpt = row.excerpt ? String(row.excerpt) : String(row.content ?? "").slice(0, 200);
    blogSnippets.push(`- "${title}": ${excerpt}`);
  }

  if (blogSnippets.length > 0) {
    contextDocs.push(`Published blog posts:\n${blogSnippets.join("\n")}`);
  }

  return chatWithContext(adapter, messages, contextDocs);
}

export async function generateDraft(title: string, outline?: string) {
  return generateBlogDraft(adapter, title, outline);
}

export async function generateMeta(pageTitle: string, contentPreview: string) {
  return generateMetaDescription(adapter, pageTitle, contentPreview);
}
