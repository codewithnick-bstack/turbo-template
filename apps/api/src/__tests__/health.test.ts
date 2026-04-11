import request from "supertest";
import { describe, expect, it } from "vitest";

import app from "../app";

describe("api health", () => {
  it("returns a healthy response", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it("validates the contact payload", async () => {
    const response = await request(app).post("/api/contact").send({ name: "A", email: "bad", message: "short" });

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
  });
});
