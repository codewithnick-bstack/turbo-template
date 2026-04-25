export type TextBlock = { type: "text"; text: string };
export type ToolUseBlock = { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };
export type ToolResultBlock = { type: "tool_result"; tool_use_id: string; content: string };
export type ContentBlock = TextBlock | ToolUseBlock;

// Messages can carry plain text or structured content (tool use / tool results)
export type AdapterMessage =
  | { role: "user" | "assistant"; content: string }
  | { role: "assistant"; content: ContentBlock[] }
  | { role: "user"; content: ToolResultBlock[] };

export type Tool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
};

export type CompletionRequest = {
  model: string;
  system?: string;
  messages: AdapterMessage[];
  maxTokens?: number;
  temperature?: number;
  tools?: Tool[];
};

export type CompletionResponse = {
  text: string;
  content: ContentBlock[];
  usage: { inputTokens: number; outputTokens: number };
  model: string;
  finishReason: "stop" | "length" | "content_filter" | "tool_use";
};

export interface ModelAdapter {
  name: "anthropic" | "openai" | "openrouter" | "mock";
  defaultModel: string;
  complete(req: CompletionRequest): Promise<CompletionResponse>;
  embed(input: string | string[]): Promise<number[][]>;
}
