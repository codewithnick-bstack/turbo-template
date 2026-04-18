import { Hono } from "hono";
import { Users } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const whoamiRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const result = await Users.whoami(buildCtx(c));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
