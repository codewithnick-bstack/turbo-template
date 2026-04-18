export type CompletionRequest = {
  model: string;
  system?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  temperature?: number;
};

export type CompletionResponse = {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
  model: string;
  finishReason: "stop" | "length" | "content_filter" | "tool_use";
};

export interface ModelAdapter {
  name: "anthropic" | "openai" | "mock";
  complete(req: CompletionRequest): Promise<CompletionResponse>;
  embed(input: string | string[]): Promise<number[][]>;
}
