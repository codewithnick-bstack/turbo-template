import { describe, expect, it, vi } from "vitest";

// Integration-style smoke tests using Hono's in-process request runner.
// DB calls are not exercised; these validate route wiring, auth guards, and middleware.

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

  it("returns 401 for authenticated routes without headers", async () => {
    const { buildServer } = await import("./server");
    const app = buildServer();
    const res = await app.request("/v1/sites", { method: "GET" });
    expect(res.status).toBe(401);
  });

  it("returns 401 for members route without auth", async () => {
    const { buildServer } = await import("./server");
    const app = buildServer();
    const res = await app.request("/v1/members", { method: "GET" });
    expect(res.status).toBe(401);
  });

  it("form submit without tid returns 400 (public endpoint, no auth needed)", async () => {
    const { buildServer } = await import("./server");
    const app = buildServer();
    const res = await app.request("/v1/forms/some-form-id/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "test" }),
    });
    // Missing tid param → 400, not 401 (confirms the route is public)
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("bad_request");
  });

  it("chatbot without tid returns 400 (public endpoint, no auth needed)", async () => {
    const { buildServer } = await import("./server");
    const app = buildServer();
    const res = await app.request("/v1/ai/chatbot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "hello" }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("bad_request");
  });

  it("analytics ingest without tid returns 400 (public endpoint, no auth needed)", async () => {
    const { buildServer } = await import("./server");
    const app = buildServer();
    const res = await app.request("/v1/analytics/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "page_view" }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("bad_request");
  });

  it("unknown route returns 404", async () => {
    const { buildServer } = await import("./server");
    const app = buildServer();
    const res = await app.request("/v1/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("rate-limit middleware", () => {
  it("returns 429 after exceeding max requests", async () => {
    const { rateLimit } = await import("./middleware/rate-limit");
    const { Hono } = await import("hono");

    const app = new Hono();
    app.get("/ping", rateLimit({ windowMs: 60_000, max: 2 }), (c) => c.json({ ok: true }));

    const makeReq = () =>
      app.request("/ping", { method: "GET", headers: { "x-forwarded-for": "1.2.3.4" } });

    expect((await makeReq()).status).toBe(200);
    expect((await makeReq()).status).toBe(200);
    expect((await makeReq()).status).toBe(429);

    const body = (await (await makeReq()).json()) as { code: string };
    expect(body.code).toBe("rate_limited");
  });

  it("different IPs have separate buckets", async () => {
    const { rateLimit } = await import("./middleware/rate-limit");
    const { Hono } = await import("hono");

    const app = new Hono();
    app.get("/ping", rateLimit({ windowMs: 60_000, max: 1 }), (c) => c.json({ ok: true }));

    const reqA = () => app.request("/ping", { method: "GET", headers: { "x-forwarded-for": "10.0.0.1" } });
    const reqB = () => app.request("/ping", { method: "GET", headers: { "x-forwarded-for": "10.0.0.2" } });

    expect((await reqA()).status).toBe(200);
    expect((await reqA()).status).toBe(429);
    // IP B still within limit
    expect((await reqB()).status).toBe(200);
  });
});

describe("auth middleware production guard", () => {
  it("rejects mock auth in production", async () => {
    vi.stubEnv("AUTH_PROVIDER", "mock");
    vi.stubEnv("NODE_ENV", "production");

    const { authMiddleware } = await import("./middleware/auth");
    const { Hono } = await import("hono");

    const app = new Hono();
    app.get("/secret", authMiddleware as Parameters<typeof app.get>[1], (c) => c.json({ ok: true }));

    const res = await app.request("/secret", {
      method: "GET",
      headers: { "x-tenant-id": "t1", "x-user-id": "u1", "x-role": "owner" },
    });
    expect(res.status).toBe(500);

    vi.unstubAllEnvs();
  });
});
