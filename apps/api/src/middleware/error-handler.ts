import type { Request, Response, NextFunction } from "express";
import { isAppError } from "@repo/observability";
import { ZodError } from "zod";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (isAppError(err)) {
    res.status(err.status).json(err.toJSON());
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      code: "unprocessable",
      message: "Validation failed",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (process.env.NODE_ENV !== "production") console.error("[api] unhandled error", err);
  res.status(500).json({ code: "internal", message: "An unexpected error occurred" });
}
