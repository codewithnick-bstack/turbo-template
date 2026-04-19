import type { MiddlewareHandler } from "hono";

type Entry = { count: number; windowStart: number };

export function rateLimit(opts: { windowMs: number; max: number }): MiddlewareHandler {
  const store = new Map<string, Entry>();

  // Prune entries older than the window every 5 minutes
  const pruneInterval = setInterval(() => {
    const cutoff = Date.now() - opts.windowMs;
    for (const [key, entry] of store) {
      if (entry.windowStart < cutoff) store.delete(key);
    }
  }, 300_000);
  if (typeof pruneInterval === "object" && "unref" in pruneInterval) {
    (pruneInterval as NodeJS.Timeout).unref();
  }

  return async (c, next) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      c.req.header("cf-connecting-ip") ??
      "unknown";
    const key = `${c.req.path}:${ip}`;
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart > opts.windowMs) {
      store.set(key, { count: 1, windowStart: now });
    } else {
      entry.count++;
      if (entry.count > opts.max) {
        const retryAfter = Math.ceil((entry.windowStart + opts.windowMs - now) / 1000);
        c.header("Retry-After", String(retryAfter));
        return c.json({ code: "rate_limited", message: "Too many requests" }, 429);
      }
    }

    await next();
  };
}
