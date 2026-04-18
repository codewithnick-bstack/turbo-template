import { Hono } from "hono";
import { createModelAdapter } from "@repo/ai";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { handleError } from "../lib/errors";
import { env } from "../env";

const adapter = createModelAdapter({
  provider: (env.AI_PROVIDER as "anthropic" | "openai" | "mock") ?? "mock",
  anthropicApiKey: env.ANTHROPIC_API_KEY,
  openaiApiKey: env.OPENAI_API_KEY,
});

export const aiRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .post("/complete", async (c) => {
    try {
      const body = await c.req.json();
      const result = await adapter.complete(body);
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/embed", async (c) => {
    try {
      const { input } = await c.req.json<{ input: string | string[] }>();
      const embeddings = await adapter.embed(input);
      return c.json({ embeddings });
    } catch (err) { return handleError(err, c); }
  });
