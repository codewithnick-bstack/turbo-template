export type SLODefinition = {
  id: string;
  name: string;
  description: string;
  target: number;
  window: "30d" | "7d" | "24h";
  metric: "availability" | "latency_p99" | "latency_p95" | "error_rate";
  threshold?: number;
};

export type SLOStatus = {
  id: string;
  target: number;
  current: number;
  errorBudgetRemaining: number;
  withinSLO: boolean;
};

export const PLATFORM_SLOS: SLODefinition[] = [
  {
    id: "api-availability",
    name: "API Availability",
    description: "Platform API responds to requests successfully.",
    target: 99.9,
    window: "30d",
    metric: "availability",
  },
  {
    id: "api-latency-p99",
    name: "API Latency p99",
    description: "99th percentile response time for API requests.",
    target: 99.0,
    window: "30d",
    metric: "latency_p99",
    threshold: 500,
  },
  {
    id: "mcp-availability",
    name: "MCP Server Availability",
    description: "MCP agent tool server availability.",
    target: 99.5,
    window: "30d",
    metric: "availability",
  },
  {
    id: "builder-availability",
    name: "Builder Availability",
    description: "Visual page builder loads and saves content.",
    target: 99.5,
    window: "30d",
    metric: "availability",
  },
  {
    id: "media-cdn-availability",
    name: "Media CDN Availability",
    description: "Media assets are delivered successfully.",
    target: 99.95,
    window: "30d",
    metric: "availability",
  },
];

export function calcErrorBudget(target: number, current: number): number {
  const maxAllowedError = 100 - target;
  const usedError = 100 - current;
  if (maxAllowedError <= 0) return current >= target ? 100 : 0;
  return Math.max(0, ((maxAllowedError - usedError) / maxAllowedError) * 100);
}

export function checkSLO(slo: SLODefinition, currentValue: number): SLOStatus {
  return {
    id: slo.id,
    target: slo.target,
    current: currentValue,
    errorBudgetRemaining: calcErrorBudget(slo.target, currentValue),
    withinSLO: currentValue >= slo.target,
  };
}

export type SLORecord = {
  service: string;
  operation: string;
  success: boolean;
  durationMs: number;
  timestamp: Date;
};

export type SLORecorder = {
  record(entry: SLORecord): void;
  flush?(): Promise<void>;
};

export function createConsoleSLORecorder(): SLORecorder {
  return {
    record(entry) {
      if (!entry.success || entry.durationMs > 1000) {
        console.warn("[SLO]", JSON.stringify({
          service: entry.service,
          op: entry.operation,
          ok: entry.success,
          ms: entry.durationMs,
          ts: entry.timestamp.toISOString(),
        }));
      }
    },
  };
}

let _recorder: SLORecorder | null = null;

export function initSLORecorder(recorder: SLORecorder): void {
  _recorder = recorder;
}

export function recordSLO(entry: SLORecord): void {
  _recorder?.record(entry);
}

export async function withSLO<T>(
  service: string,
  operation: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  let success = true;
  try {
    return await fn();
  } catch (err) {
    success = false;
    throw err;
  } finally {
    recordSLO({ service, operation, success, durationMs: Date.now() - start, timestamp: new Date() });
  }
}
