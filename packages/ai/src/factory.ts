import type { ModelAdapter } from "./adapter";
import { mockAdapter } from "./adapters/mock";
import { createAnthropicAdapter } from "./adapters/anthropic";
import { createOpenAIAdapter } from "./adapters/openai";
import { createOpenRouterAdapter } from "./adapters/openrouter";

type AdapterOptions = {
  provider?: "anthropic" | "openai" | "openrouter" | "mock";
  anthropicApiKey?: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  defaultModel?: string;
  siteUrl?: string;
  siteName?: string;
};

export function createModelAdapter(options: AdapterOptions = {}): ModelAdapter {
  const provider = options.provider ?? "mock";

  if (provider === "anthropic") {
    if (!options.anthropicApiKey) {
      console.warn("[ai] ANTHROPIC_API_KEY not set — falling back to mock adapter");
      return mockAdapter;
    }
    return createAnthropicAdapter(options.anthropicApiKey, options.defaultModel);
  }

  if (provider === "openai") {
    if (!options.openaiApiKey) {
      console.warn("[ai] OPENAI_API_KEY not set — falling back to mock adapter");
      return mockAdapter;
    }
    return createOpenAIAdapter(options.openaiApiKey, options.defaultModel);
  }

  if (provider === "openrouter") {
    if (!options.openrouterApiKey) {
      console.warn("[ai] OPENROUTER_API_KEY not set — falling back to mock adapter");
      return mockAdapter;
    }
    return createOpenRouterAdapter(
      options.openrouterApiKey,
      options.defaultModel,
      options.siteUrl,
      options.siteName,
    );
  }

  return mockAdapter;
}
