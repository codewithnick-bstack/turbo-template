import type { ModelAdapter, CompletionRequest, CompletionResponse } from "../adapter";

export function createOpenAIAdapter(apiKey: string, defaultModel = "gpt-4o"): ModelAdapter {
  return {
    name: "openai",

    async complete(req: CompletionRequest): Promise<CompletionResponse> {
      const messages = [
        ...(req.system ? [{ role: "system", content: req.system }] : []),
        ...req.messages,
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: req.model || defaultModel,
          max_tokens: req.maxTokens ?? 2048,
          temperature: req.temperature,
          messages,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`OpenAI API error ${res.status}: ${body}`);
      }

      const data = await res.json() as {
        choices: Array<{ message: { content: string }; finish_reason: string }>;
        usage: { prompt_tokens: number; completion_tokens: number };
        model: string;
      };

      const text = data.choices[0]?.message.content ?? "";
      const finishReason = data.choices[0]?.finish_reason;
      return {
        text,
        usage: { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens },
        model: data.model,
        finishReason: finishReason === "stop" ? "stop" : finishReason === "length" ? "length" : "stop",
      };
    },

    async embed(input: string | string[]): Promise<number[][]> {
      const items = Array.isArray(input) ? input : [input];
      const res = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ model: "text-embedding-3-small", input: items }),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`OpenAI embeddings error ${res.status}: ${body}`);
      }

      const data = await res.json() as { data: Array<{ embedding: number[] }> };
      return data.data.map((d) => d.embedding);
    },
  };
}
