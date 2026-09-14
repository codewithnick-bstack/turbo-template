import type { ModelAdapter, CompletionRequest, CompletionResponse, ContentBlock } from "../adapter";

export function createAnthropicAdapter(apiKey: string, defaultModel = "claude-opus-4-7"): ModelAdapter {
  return {
    name: "anthropic",
    defaultModel,

    async complete(req: CompletionRequest): Promise<CompletionResponse> {
      const body: Record<string, unknown> = {
        model: req.model || defaultModel,
        max_tokens: req.maxTokens ?? 2048,
        temperature: req.temperature,
        system: req.system,
        messages: req.messages,
      };

      if (req.tools?.length) {
        body.tools = req.tools.map((t) => ({
          name: t.name,
          description: t.description,
          input_schema: t.inputSchema,
        }));
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Anthropic API error ${res.status}: ${errBody}`);
      }

      const data = await res.json() as {
        content: Array<{ type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }>;
        usage: { input_tokens: number; output_tokens: number };
        model: string;
        stop_reason: string;
      };

      const content: ContentBlock[] = data.content.map((b) => {
        if (b.type === "tool_use") {
          return { type: "tool_use", id: b.id!, name: b.name!, input: b.input ?? {} };
        }
        return { type: "text", text: b.text ?? "" };
      });

      const text = content.filter((b): b is { type: "text"; text: string } => b.type === "text").map((b) => b.text).join("");

      const stopReason = data.stop_reason;
      const finishReason =
        stopReason === "end_turn" ? "stop"
        : stopReason === "tool_use" ? "tool_use"
        : stopReason === "max_tokens" ? "length"
        : "stop";

      return {
        text,
        content,
        usage: { inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens },
        model: data.model,
        finishReason,
      };
    },

    async embed(_input: string | string[]): Promise<number[][]> {
      throw new Error("Anthropic does not support embeddings. Use a different adapter.");
    },
  };
}
