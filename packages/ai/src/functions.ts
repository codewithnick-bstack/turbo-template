import type { ModelAdapter } from "./adapter";
import { CHATBOT_SYSTEM, BLOG_GENERATOR_SYSTEM, META_GENERATOR_SYSTEM } from "./prompts";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function chatWithContext(
  adapter: ModelAdapter,
  messages: ChatMessage[],
  contextDocs: string[],
): Promise<string> {
  const context = contextDocs.length > 0 ? `\n\nContext about this business:\n${contextDocs.join("\n\n")}` : "";
  const system = CHATBOT_SYSTEM + context;

  const response = await adapter.complete({
    model: adapter.name === "anthropic" ? "claude-haiku-4-5" : "gpt-4o-mini",
    system,
    messages,
    maxTokens: 1024,
    temperature: 0.7,
  });

  return response.text;
}

export async function generateBlogDraft(
  adapter: ModelAdapter,
  title: string,
  outline?: string,
): Promise<string> {
  const userPrompt = outline
    ? `Title: ${title}\n\nOutline:\n${outline}`
    : `Title: ${title}`;

  const response = await adapter.complete({
    model: adapter.name === "anthropic" ? "claude-haiku-4-5" : "gpt-4o-mini",
    system: BLOG_GENERATOR_SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 2048,
    temperature: 0.8,
  });

  return response.text;
}

export async function generateMetaDescription(
  adapter: ModelAdapter,
  pageTitle: string,
  contentPreview: string,
): Promise<string> {
  const userPrompt = `Page title: ${pageTitle}\n\nContent preview:\n${contentPreview.slice(0, 500)}`;

  const response = await adapter.complete({
    model: adapter.name === "anthropic" ? "claude-haiku-4-5" : "gpt-4o-mini",
    system: META_GENERATOR_SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 100,
    temperature: 0.5,
  });

  return response.text.trim().slice(0, 155);
}
