import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env";
import { toolDefinitions, type ToolContext } from "./tools";

export function buildMcpServer() {
  const app = new Hono();

  app.use("*", cors());

  app.get("/health", (c) =>
    c.json({ ok: true, service: "mcp", env: env.NODE_ENV, toolCount: toolDefinitions.length }),
  );

  app.get("/manifest", (c) =>
    c.json({
      version: "0.1.0",
      tools: toolDefinitions.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
        annotations: t.annotations,
      })),
    }),
  );

  app.post("/tools/:name", async (c) => {
    const tool = toolDefinitions.find((t) => t.name === c.req.param("name"));
    if (!tool) return c.json({ code: "not_found", message: "unknown tool" }, 404);

    const apiKey = c.req.header("authorization")?.replace(/^Bearer\s+/, "");
    if (!apiKey) return c.json({ code: "unauthorized", message: "missing api key" }, 401);

    const tenantId = c.req.header("x-tenant-id") ?? "";
    if (!tenantId) return c.json({ code: "unauthorized", message: "missing x-tenant-id header" }, 401);

    const ctx: ToolContext = { apiKey, tenantId, baseUrl: env.PLATFORM_API_URL };
    try {
      const input = await c.req.json().catch(() => ({}));
      const result = await tool.handler(input, ctx);
      return c.json({ ok: true, result });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ ok: false, error: { code: "tool_error", message } }, 500);
    }
  });

  return app;
}
