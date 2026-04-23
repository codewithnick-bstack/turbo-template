import { Hono } from "hono";
import { PLATFORM_SLOS, checkSLO } from "@repo/observability";

export const sloRoute = new Hono().get("/", (c) => {
  const statuses = PLATFORM_SLOS.map((slo) => ({
    ...slo,
    ...checkSLO(slo, 100.0),
  }));

  const allWithinSLO = statuses.every((s) => s.withinSLO);

  return c.json({
    ok: allWithinSLO,
    timestamp: new Date().toISOString(),
    slos: statuses,
  }, allWithinSLO ? 200 : 503);
});
