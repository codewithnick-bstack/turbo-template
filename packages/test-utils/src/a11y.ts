import type { AxeResults, Result } from "axe-core";

export type A11yViolation = {
  id: string;
  impact: string | null;
  description: string;
  nodes: number;
  helpUrl: string;
};

export function summarizeViolations(results: AxeResults): A11yViolation[] {
  return results.violations.map((v: Result) => ({
    id: v.id,
    impact: v.impact ?? null,
    description: v.description,
    nodes: v.nodes.length,
    helpUrl: v.helpUrl,
  }));
}

export function assertNoViolations(results: AxeResults, allowedIds: string[] = []): void {
  const violations = summarizeViolations(results).filter(
    (v) => !allowedIds.includes(v.id),
  );
  if (violations.length > 0) {
    const list = violations
      .map((v) => `  [${v.impact ?? "unknown"}] ${v.id}: ${v.description} (${v.nodes} node${v.nodes !== 1 ? "s" : ""})`)
      .join("\n");
    throw new Error(`${violations.length} accessibility violation${violations.length !== 1 ? "s" : ""}:\n${list}`);
  }
}

export function criticalViolations(results: AxeResults): A11yViolation[] {
  return summarizeViolations(results).filter(
    (v) => v.impact === "critical" || v.impact === "serious",
  );
}
