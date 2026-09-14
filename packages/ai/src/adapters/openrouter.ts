import type {
  ModelAdapter,
  CompletionRequest,
  CompletionResponse,
  AdapterMessage,
  ContentBlock,
  Tool,
} from "../adapter";

type OpenAIMessage = Record<string, unknown>;

function toOpenAIMessages(messages: AdapterMessage[], system?: string): OpenAIMessage[] {
  const result: OpenAIMessage[] = [];

  if (system) result.push({ role: "system", content: system });

  for (const msg of messages) {
    if (typeof msg.content === "string") {
      result.push({ role: msg.role, content: msg.content });
      continue;
    }

    if (!Array.isArray(msg.content)) continue;

    // User message with tool results → multiple "tool" role messages
    if (msg.role === "user") {
      for (const block of msg.content) {
        if ("tool_use_id" in block) {
          result.push({ role: "tool", tool_call_id: block.tool_use_id, content: block.content });
        }
      }
      continue;
    }

    // Assistant message with content blocks → text + tool_calls
    const textParts = msg.content
      .filter((b) => b.type === "text")
      .map((b) => ("text" in b ? b.text : ""))
      .join("") || null;

    const toolCalls = msg.content
      .filter((b) => b.type === "tool_use")
      .map((b) => {
        if (!("id" in b)) return null;
        return {
          id: b.id,
          type: "function",
          function: { name: b.name, arguments: JSON.stringify(b.input) },
        };
      })
      .filter(Boolean);

    const assistantMsg: OpenAIMessage = { role: "assistant", content: textParts };
    if (toolCalls.length > 0) assistantMsg.tool_calls = toolCalls;
    result.push(assistantMsg);
  }

  return result;
}

function toOpenAITools(tools: Tool[]) {
  return tools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  }));
}

export function createOpenRouterAdapter(
  apiKey: string,
  defaultModel = "anthropic/claude-haiku-4-5",
  siteUrl?: string,
  siteName?: string,
): ModelAdapter {
  return {
    name: "openrouter",
    defaultModel,

    async complete(req: CompletionRequest): Promise<CompletionResponse> {
      const messages = toOpenAIMessages(req.messages, req.system);

      const body: Record<string, unknown> = {
        model: req.model || defaultModel,
        max_tokens: req.maxTokens ?? 2048,
        temperature: req.temperature,
        messages,
      };

      if (req.tools?.length) {
        body.tools = toOpenAITools(req.tools);
        body.tool_choice = "auto";
      }

      const headers: Record<string, string> = {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "HTTP-Referer": siteUrl ?? "https://localhost",
        "X-Title": siteName ?? "Website Chatbot",
      };

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`OpenRouter API error ${res.status}: ${errBody}`);
      }

      const data = await res.json() as {
        choices: Array<{
          message: {
            content: string | null;
            tool_calls?: Array<{
              id: string;
              type: string;
              function: { name: string; arguments: string };
            }>;
          };
          finish_reason: string;
        }>;
        usage: { prompt_tokens: number; completion_tokens: number };
        model: string;
      };

      const choice = data.choices[0];
      const content: ContentBlock[] = [];

      if (choice?.message.content) {
        content.push({ type: "text", text: choice.message.content });
      }

      if (choice?.message.tool_calls?.length) {
        for (const tc of choice.message.tool_calls) {
          let input: Record<string, unknown> = {};
          try { input = JSON.parse(tc.function.arguments) as Record<string, unknown>; } catch { /* ignore */ }
          content.push({ type: "tool_use", id: tc.id, name: tc.function.name, input });
        }
      }

      const text = content.filter((b): b is { type: "text"; text: string } => b.type === "text").map((b) => b.text).join("");
      const finishReason = choice?.finish_reason;

      return {
        text,
        content,
        usage: { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens },
        model: data.model,
        finishReason:
          finishReason === "tool_calls" ? "tool_use"
          : finishReason === "length" ? "length"
          : "stop",
      };
    },

    async embed(_input: string | string[]): Promise<number[][]> {
      throw new Error("Use a dedicated embeddings model via OpenRouter for embeddings.");
    },
  };
}
