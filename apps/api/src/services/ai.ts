import { sql } from "drizzle-orm";
import type { Db } from "@repo/db";
import {
  createModelAdapter,
  chatWithContext,
  chatWithTools,
  generateBlogDraft,
  generateMetaDescription,
  type ChatMessage,
  type ToolDefinition,
} from "@repo/ai";
import { env } from "../env";
import * as teamService from "./team";
import * as portfolioService from "./portfolio";
import * as testimonialsService from "./testimonials";
import * as calService from "./cal";

const adapter = createModelAdapter({
  provider: env.AI_PROVIDER,
  ...(env.ANTHROPIC_API_KEY ? { anthropicApiKey: env.ANTHROPIC_API_KEY } : {}),
  ...(env.OPENAI_API_KEY ? { openaiApiKey: env.OPENAI_API_KEY } : {}),
  ...(env.OPENROUTER_API_KEY ? { openrouterApiKey: env.OPENROUTER_API_KEY } : {}),
  ...(env.AI_MODEL ? { defaultModel: env.AI_MODEL } : {}),
  siteUrl: env.WEB_URL,
});

async function buildContextDocs(db: Db): Promise<string[]> {
  const [settingsResult, teamResult, portfolioResult, testimonialsResult] =
    await Promise.allSettled([
      db.query.siteSettings.findFirst(),
      teamService.listTeamMembers(db, { limit: 20 }),
      portfolioService.listPortfolioEntries(db, { limit: 20 }),
      testimonialsService.listTestimonials(db, { featuredOnly: true, limit: 10 }),
    ]);

  const docs: string[] = [];

  if (settingsResult.status === "fulfilled" && settingsResult.value) {
    const s = settingsResult.value;
    const parts = [`Business: ${s.businessName}`];
    if (s.tagline) parts.push(`Tagline: ${s.tagline}`);
    if (s.email) parts.push(`Email: ${s.email}`);
    if (s.phone) parts.push(`Phone: ${s.phone}`);
    if (s.address) parts.push(`Address: ${s.address}`);
    if (s.seoDescription) parts.push(`About: ${s.seoDescription}`);
    docs.push(parts.join("\n"));
  }

  if (teamResult.status === "fulfilled" && teamResult.value.length > 0) {
    const members = teamResult.value
      .map((m) => `- ${m.name}, ${m.title}${m.bio ? `: ${m.bio.slice(0, 120)}` : ""}`)
      .join("\n");
    docs.push(`Team members:\n${members}`);
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
    docs.push(`Portfolio work:\n${entries}`);
  }

  if (testimonialsResult.status === "fulfilled" && testimonialsResult.value.length > 0) {
    const quotes = testimonialsResult.value
      .map((t) => `- "${t.quote.slice(0, 150)}" — ${t.authorName}${t.company ? `, ${t.company}` : ""}`)
      .join("\n");
    docs.push(`Client testimonials:\n${quotes}`);
  }

  return docs;
}

function buildTools(db: Db): ToolDefinition[] {
  const tools: ToolDefinition[] = [
    {
      name: "search_blog_posts",
      description: "Search published blog posts by keyword. Use when the visitor asks about a specific topic covered in the blog.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keywords" },
        },
        required: ["query"],
      },
      async execute({ query }) {
        const q = String(query).slice(0, 200);
        const result = await db.execute(
          sql`SELECT title, excerpt, slug FROM blog_posts WHERE status = 'published' AND to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content) @@ plainto_tsquery('english', ${q}) LIMIT 4`,
        );
        const rows = (Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows ?? []) as { title?: unknown; excerpt?: unknown; slug?: unknown }[];
        if (rows.length === 0) return "No blog posts found matching that topic.";
        return rows.map((r) => `- "${r.title}": ${r.excerpt ?? ""}`.trim()).join("\n");
      },
    },
  ];

  // Scheduling tools — only added when Cal.com is configured
  if (env.CAL_API_KEY && env.CAL_EVENT_TYPE_ID) {
    const calKey = env.CAL_API_KEY;
    const calEventTypeId = env.CAL_EVENT_TYPE_ID;

    tools.push({
      name: "check_availability",
      description: "Check available meeting slots for a given date range. Use when the visitor asks about booking a call or meeting.",
      inputSchema: {
        type: "object",
        properties: {
          start_date: { type: "string", description: "Start date in YYYY-MM-DD format" },
          end_date: { type: "string", description: "End date in YYYY-MM-DD format (max 7 days after start)" },
        },
        required: ["start_date", "end_date"],
      },
      async execute({ start_date, end_date }) {
        return calService.getAvailableSlots(calKey, calEventTypeId, String(start_date), String(end_date));
      },
    });

    tools.push({
      name: "book_meeting",
      description: "Book a meeting slot. Only call this after the visitor has confirmed their name, email, and chosen a specific time slot from check_availability.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Visitor's full name" },
          email: { type: "string", description: "Visitor's email address" },
          start_time: { type: "string", description: "ISO 8601 datetime of the chosen slot (e.g. 2026-04-28T09:00:00.000Z)" },
          notes: { type: "string", description: "Optional notes about the meeting purpose" },
        },
        required: ["name", "email", "start_time"],
      },
      async execute({ name, email, start_time, notes }) {
        return calService.createBooking(calKey, calEventTypeId, {
          name: String(name),
          email: String(email),
          startTime: String(start_time),
          ...(notes ? { notes: String(notes) } : {}),
        });
      },
    });
  }

  return tools;
}

export async function chatWithSiteContext(db: Db, messages: ChatMessage[]) {
  const [contextDocs, tools] = await Promise.all([
    buildContextDocs(db),
    Promise.resolve(buildTools(db)),
  ]);

  // Use tool-calling loop for providers that support it
  if ((adapter.name === "anthropic" || adapter.name === "openrouter") && tools.length > 0) {
    return chatWithTools(adapter, messages, contextDocs, tools);
  }

  return chatWithContext(adapter, messages, contextDocs);
}

export async function generateDraft(title: string, outline?: string) {
  return generateBlogDraft(adapter, title, outline);
}

export async function generateMeta(pageTitle: string, contentPreview: string) {
  return generateMetaDescription(adapter, pageTitle, contentPreview);
}
