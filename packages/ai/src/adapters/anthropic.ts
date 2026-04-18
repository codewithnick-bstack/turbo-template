import type { ModelAdapter, CompletionRequest, CompletionResponse } from "../adapter";

export function createAnthropicAdapter(apiKey: string, defaultModel = "claude-opus-4-7"): ModelAdapter {
  return {
    name: "anthropic",

    async complete(req: CompletionRequest): Promise<CompletionResponse> {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: req.model || defaultModel,
          max_tokens: req.maxTokens ?? 2048,
          temperature: req.temperature,
          system: req.system,
          messages: req.messages,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Anthropic API error ${res.status}: ${body}`);
      }

      const data = await res.json() as {
        content: Array<{ type: string; text: string }>;
        usage: { input_tokens: number; output_tokens: number };
        model: string;
        stop_reason: string;
      };

      const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      return {
        text,
        usage: { inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens },
        model: data.model,
        finishReason: data.stop_reason === "end_turn" ? "stop" : (data.stop_reason as CompletionResponse["finishReason"]),
      };
    },

    async embed(_input: string | string[]): Promise<number[][]> {
      throw new Error("Anthropic does not support embeddings. Use a different adapter.");
    },
  };
}
