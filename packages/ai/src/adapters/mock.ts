import type { ModelAdapter, CompletionRequest, CompletionResponse } from "../adapter";

const MOCK_RESPONSES: Record<string, string> = {
  default: "This is a mock AI response. Configure ANTHROPIC_API_KEY for real completions.",
  blog: "# Draft Post\n\nThis is a mock blog draft. Real content generation requires an Anthropic API key.",
  seo: JSON.stringify([{ severity: "info", rule: "mock", evidence: "mock mode active", suggested_fix: "Set ANTHROPIC_API_KEY" }]),
};

function detectIntent(req: CompletionRequest): string {
  const last = req.messages.at(-1)?.content.toLowerCase() ?? "";
  if (last.includes("blog") || last.includes("post") || req.system?.includes("blog")) return "blog";
  if (last.includes("seo") || last.includes("audit") || req.system?.includes("seo")) return "seo";
  return "default";
}

export const mockAdapter: ModelAdapter = {
  name: "mock",

  async complete(req: CompletionRequest): Promise<CompletionResponse> {
    const intent = detectIntent(req);
    const text = MOCK_RESPONSES[intent] ?? MOCK_RESPONSES.default;
    return {
      text,
      usage: { inputTokens: 100, outputTokens: text.split(/\s+/).length },
      model: "mock-v1",
      finishReason: "stop",
    };
  },

  async embed(input: string | string[]): Promise<number[][]> {
    const items = Array.isArray(input) ? input : [input];
    return items.map((s) => {
      const seed = s.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return Array.from({ length: 1536 }, (_, i) => Math.sin(seed + i) * 0.1);
    });
  },
};
