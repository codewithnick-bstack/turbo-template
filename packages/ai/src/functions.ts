import type { ModelAdapter, AdapterMessage, Tool, ToolUseBlock } from "./adapter";
import { CHATBOT_SYSTEM, BLOG_GENERATOR_SYSTEM, META_GENERATOR_SYSTEM } from "./prompts";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ToolDefinition = Tool & {
  execute(input: Record<string, unknown>): Promise<string>;
};

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

export async function chatWithTools(
  adapter: ModelAdapter,
  messages: ChatMessage[],
  contextDocs: string[],
  tools: ToolDefinition[],
): Promise<string> {
  const context = contextDocs.length > 0 ? `\n\nContext about this business:\n${contextDocs.join("\n\n")}` : "";
  const system = CHATBOT_SYSTEM + context;

  let history: AdapterMessage[] = [...messages];

  // Up to 5 tool-use rounds before forcing a final response
  for (let round = 0; round < 5; round++) {
    const response = await adapter.complete({
      model: adapter.name === "anthropic" ? "claude-haiku-4-5" : "gpt-4o-mini",
      system,
      messages: history,
      maxTokens: 1024,
      temperature: 0.7,
      tools: tools.map(({ execute: _exec, ...t }) => t),
    });

    if (response.finishReason !== "tool_use") {
      return response.text;
    }

    const toolUses = response.content.filter((b): b is ToolUseBlock => b.type === "tool_use");
    if (toolUses.length === 0) return response.text;

    // Append assistant message with full content blocks
    history = [...history, { role: "assistant", content: response.content }];

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      toolUses.map(async (tu) => {
        const tool = tools.find((t) => t.name === tu.name);
        let result: string;
        try {
          result = tool
            ? await tool.execute(tu.input)
            : `Unknown tool: ${tu.name}`;
        } catch (err) {
          result = `Tool error: ${err instanceof Error ? err.message : "execution failed"}`;
        }
        return { type: "tool_result" as const, tool_use_id: tu.id, content: result };
      }),
    );

    // Append tool results as user message
    history = [...history, { role: "user", content: toolResults }];
  }

  // Max rounds reached — get final text response without tools
  const final = await adapter.complete({
    model: adapter.name === "anthropic" ? "claude-haiku-4-5" : "gpt-4o-mini",
    system,
    messages: history,
    maxTokens: 1024,
    temperature: 0.7,
  });
  return final.text;
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
