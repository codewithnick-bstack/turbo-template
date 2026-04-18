import { describe, expect, it } from "vitest";

describe("mcp server", () => {
  it("returns a manifest listing all tools", async () => {
    process.env.MCP_AUTH_SECRET = "a-sufficiently-long-test-secret-value-123";
    process.env.PLATFORM_API_URL = "http://localhost:4100";
    const { buildMcpServer } = await import("./server");
    const app = buildMcpServer();

    const health = await app.request("/health");
    expect(health.status).toBe(200);

    const manifest = await app.request("/manifest");
    expect(manifest.status).toBe(200);
    const body = (await manifest.json()) as { tools: { name: string }[] };
    const names = body.tools.map((t) => t.name);
    expect(names).toContain("list_sites");
    expect(names).toContain("create_site");
    expect(names).toContain("publish_page");
  });

  it("rejects tool call without api key", async () => {
    process.env.MCP_AUTH_SECRET = "a-sufficiently-long-test-secret-value-123";
    process.env.PLATFORM_API_URL = "http://localhost:4100";
    const { buildMcpServer } = await import("./server");
    const app = buildMcpServer();

    const res = await app.request("/tools/list_sites", { method: "POST" });
    expect(res.status).toBe(401);
  });
});
