import type { Request, Response, NextFunction } from "express";
import type { Auth } from "@repo/auth";

function toWebHeaders(headers: Record<string, string | string[] | undefined>): Headers {
  const webHeaders = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    webHeaders.set(key, Array.isArray(value) ? value.join(", ") : value);
  }
  return webHeaders;
}

export function createAuthGuard(auth: Auth) {
  return async function authGuard(req: Request, res: Response, next: NextFunction) {
    try {
      const session = await auth.api.getSession({ headers: toWebHeaders(req.headers) });
      if (!session) {
        res.status(401).json({ code: "unauthorized", message: "Authentication required" });
        return;
      }
      (req as Request & { session: typeof session }).session = session;
      next();
    } catch {
      res.status(401).json({ code: "unauthorized", message: "Authentication required" });
    }
  };
}
