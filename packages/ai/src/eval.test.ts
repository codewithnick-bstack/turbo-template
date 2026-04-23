import { describe, it, expect } from "vitest";
import { runEval, runEvalSuite } from "./eval";
import { mockAdapter } from "./adapters/mock";

describe("runEval", () => {
  it("passes when all assertions pass", async () => {
    const result = await runEval(mockAdapter, {
      name: "basic response",
      request: {
        model: "mock-v1",
        messages: [{ role: "user", content: "hello" }],
      },
      assertions: [
        { type: "min_length", chars: 5 },
        { type: "contains", value: "mock" },
      ],
    });
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it("fails when assertion fails", async () => {
    const result = await runEval(mockAdapter, {
      name: "impossible assertion",
      request: {
        model: "mock-v1",
        messages: [{ role: "user", content: "hello" }],
      },
      assertions: [{ type: "contains", value: "this_string_will_never_appear_xyz123" }],
    });
    expect(result.passed).toBe(false);
    expect(result.failures).toHaveLength(1);
  });

  it("validates json_valid assertion on seo response", async () => {
    const result = await runEval(mockAdapter, {
      name: "seo audit returns json",
      request: {
        model: "mock-v1",
        messages: [{ role: "user", content: "audit my seo" }],
        system: "seo auditor",
      },
      assertions: [{ type: "json_valid" }],
    });
    expect(result.passed).toBe(true);
  });

  it("custom assertion receives full response", async () => {
    const result = await runEval(mockAdapter, {
      name: "custom check",
      request: {
        model: "mock-v1",
        messages: [{ role: "user", content: "hello" }],
      },
      assertions: [
        {
          type: "custom",
          fn: (response) => response.usage.outputTokens > 0,
        },
      ],
    });
    expect(result.passed).toBe(true);
  });
});

describe("runEvalSuite", () => {
  it("aggregates pass/fail counts", async () => {
    const suite = await runEvalSuite(mockAdapter, [
      {
        name: "pass",
        request: { model: "mock-v1", messages: [{ role: "user", content: "hello" }] },
        assertions: [{ type: "min_length", chars: 1 }],
      },
      {
        name: "fail",
        request: { model: "mock-v1", messages: [{ role: "user", content: "hello" }] },
        assertions: [{ type: "max_length", chars: 0 }],
      },
    ]);
    expect(suite.total).toBe(2);
    expect(suite.passed).toBe(1);
    expect(suite.failed).toBe(1);
  });
});
