import { describe, expect, it } from "vitest";

// Integration-style smoke: buildServer should return a Hono app with /health.
// Full route tests land in Phase 1 Unit 1.3.
describe("platform-api server", () => {
  it("serves /health", async () => {
    const { buildServer } = await import("./server");
    const app = buildServer();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; service: string };
    expect(body.ok).toBe(true);
    expect(body.service).toBe("platform-api");
  });
});
