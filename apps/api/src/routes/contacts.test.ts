import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp } from "../test/app";
import type { Db } from "@repo/db";

const mockDb = {
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
  query: { contactSubmissions: { findMany: vi.fn(), findFirst: vi.fn() } },
} as unknown as Db;

const app = createTestApp(mockDb);

describe("POST /api/v1/contacts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 with valid payload", async () => {
    (mockDb.insert as ReturnType<typeof vi.fn>).mockReturnThis();
    (mockDb as unknown as { values: ReturnType<typeof vi.fn> }).values.mockReturnThis();
    (mockDb as unknown as { returning: ReturnType<typeof vi.fn> }).returning.mockResolvedValueOnce([
      { id: "1", name: "Test", email: "test@example.com", message: "Hello", status: "new", createdAt: new Date() },
    ]);

    const res = await request(app)
      .post("/api/v1/contacts")
      .send({ name: "Test", email: "test@example.com", message: "Hello" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("returns 422 with missing message field", async () => {
    const res = await request(app)
      .post("/api/v1/contacts")
      .send({ name: "Test", email: "test@example.com" });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty("code", "unprocessable");
  });

  it("returns 422 with invalid email", async () => {
    const res = await request(app)
      .post("/api/v1/contacts")
      .send({ name: "Test", email: "not-an-email", message: "Hello" });

    expect(res.status).toBe(422);
  });
});

describe("GET /health", () => {
  it("returns 200 ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
