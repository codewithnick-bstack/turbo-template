import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import type { RequestHandler } from "express";
import { createTestApp } from "../test/app";
import type { Db } from "@repo/db";

const mockPost = {
  id: "1",
  slug: "test-post",
  title: "Test Post",
  content: "# Hello",
  excerpt: "Short",
  author: "Author",
  status: "published" as const,
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  coverImageUrl: null,
  metaTitle: null,
  metaDescription: null,
};

const mockDb = {
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  query: {
    blogPosts: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    teamMembers: { findMany: vi.fn(), findFirst: vi.fn() },
    testimonials: { findMany: vi.fn(), findFirst: vi.fn() },
    portfolioEntries: { findMany: vi.fn(), findFirst: vi.fn() },
    contactSubmissions: { findMany: vi.fn(), findFirst: vi.fn() },
  },
} as unknown as Db;

const blockingAuthGuard: RequestHandler = (_req, res) => { res.status(401).json({ code: "unauthorized", message: "Unauthorized" }); };

const openApp = createTestApp(mockDb);
const authLockedApp = createTestApp(mockDb, blockingAuthGuard);

describe("GET /api/v1/blog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns published posts", async () => {
    (mockDb.query.blogPosts.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([mockPost]);
    const res = await request(openApp).get("/api/v1/blog");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns empty array when no posts", async () => {
    (mockDb.query.blogPosts.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);
    const res = await request(openApp).get("/api/v1/blog");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("GET /api/v1/blog/:slug", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns post by slug", async () => {
    (mockDb.query.blogPosts.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockPost);
    const res = await request(openApp).get("/api/v1/blog/test-post");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("slug", "test-post");
  });

  it("returns 404 for unknown slug", async () => {
    (mockDb.query.blogPosts.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);
    const res = await request(openApp).get("/api/v1/blog/does-not-exist");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/blog — auth guard", () => {
  it("returns 401 without auth cookie", async () => {
    const res = await request(authLockedApp)
      .post("/api/v1/blog")
      .send({ slug: "new", title: "New", content: "Body" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/blog?search=", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes search param and returns results", async () => {
    (mockDb.query.blogPosts.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([mockPost]);
    const res = await request(openApp).get("/api/v1/blog?search=test");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns empty array when no matches", async () => {
    (mockDb.query.blogPosts.findMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);
    const res = await request(openApp).get("/api/v1/blog?search=zzznomatch");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
