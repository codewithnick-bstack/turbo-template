import { describe, expect, it } from "vitest";
import { AppError, isAppError } from "./errors";

describe("AppError", () => {
  it("maps codes to HTTP status", () => {
    expect(new AppError("unauthorized", "x").status).toBe(401);
    expect(new AppError("not_found", "x").status).toBe(404);
    expect(new AppError("internal", "x").status).toBe(500);
  });

  it("exposes details in toJSON", () => {
    const e = new AppError("bad_request", "bad", { details: { field: "name" } });
    expect(e.toJSON()).toEqual({ code: "bad_request", message: "bad", details: { field: "name" } });
  });

  it("marks upstream_unavailable retryable by default", () => {
    expect(new AppError("upstream_unavailable", "x").retryable).toBe(true);
    expect(new AppError("bad_request", "x").retryable).toBe(false);
  });

  it("detects AppError via isAppError", () => {
    expect(isAppError(new AppError("internal", "x"))).toBe(true);
    expect(isAppError(new Error("plain"))).toBe(false);
  });
});
