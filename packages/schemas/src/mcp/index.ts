import { z } from "zod";

export const McpToolDef = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  inputSchema: z.record(z.unknown()),
  annotations: z
    .object({
      destructive: z.boolean().default(false),
      idempotent: z.boolean().default(false),
      requiresApproval: z.boolean().default(false),
    })
    .default({}),
});

export const McpManifest = z.object({
  version: z.string(),
  tools: z.array(McpToolDef),
});

export type TMcpToolDef = z.infer<typeof McpToolDef>;
export type TMcpManifest = z.infer<typeof McpManifest>;
