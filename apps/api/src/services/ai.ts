import { sql } from "drizzle-orm";
import type { Db } from "@repo/db";
import { createModelAdapter, chatWithContext, generateBlogDraft, generateMetaDescription, type ChatMessage } from "@repo/ai";
import { env } from "../env";

const adapter = createModelAdapter({
  provider: env.AI_PROVIDER,
  ...(env.ANTHROPIC_API_KEY ? { anthropicApiKey: env.ANTHROPIC_API_KEY } : {}),
  ...(env.OPENAI_API_KEY ? { openaiApiKey: env.OPENAI_API_KEY } : {}),
  defaultModel: "claude-haiku-4-5",
});

export async function chatWithSiteContext(db: Db, messages: ChatMessage[]) {
  const lastMessage = messages.at(-1)?.content ?? "";

  const contextDocs: string[] = [];
  try {
    const settings = await db.query.siteSettings.findFirst();
    if (settings) {
      contextDocs.push(
        `Business: ${settings.businessName}\nTagline: ${settings.tagline ?? ""}\nEmail: ${settings.email ?? ""}\nAddress: ${settings.address ?? ""}`,
      );
    }

    if (lastMessage) {
      const searchQuery = lastMessage.slice(0, 200);
      const result = await db.execute(
        sql`SELECT title, excerpt, content FROM blog_posts WHERE status = 'published' AND to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content) @@ plainto_tsquery('english', ${searchQuery}) LIMIT 3`,
      );
      const rows = Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows ?? [];
      for (const row of rows as { title?: unknown; excerpt?: unknown; content?: unknown }[]) {
        if (row.title) {
          contextDocs.push(`Blog post: ${row.title}\n${row.excerpt ?? String(row.content ?? "").slice(0, 200)}`);
        }
      }
    }
  } catch (err) {
    console.error("[ai] context search failed:", err);
  }

  return chatWithContext(adapter, messages, contextDocs);
}

export async function generateDraft(title: string, outline?: string) {
  return generateBlogDraft(adapter, title, outline);
}

export async function generateMeta(pageTitle: string, contentPreview: string) {
  return generateMetaDescription(adapter, pageTitle, contentPreview);
}
