import { Hono } from "hono";
import * as Members from "@repo/core/members";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import { buildCtx, getDb } from "../ctx";
import { handleError } from "../lib/errors";
import { sendInviteEmail } from "../lib/email";
import { env } from "../env";

export const membersRoute = new Hono<AuthEnv>()
  // Public: look up invite details by token (no auth)
  .get("/invite/info", async (c) => {
    try {
      const token = c.req.query("token");
      if (!token) return c.json({ code: "bad_request", message: "token required" }, 400);
      const info = await Members.getInviteByToken(getDb(), token);
      return c.json(info);
    } catch (err) { return handleError(err, c); }
  })
  // Public: accept an invite by token
  .post("/invite/accept", rateLimit({ windowMs: 60_000, max: 5 }), async (c) => {
    try {
      const { token, name } = await c.req.json<{ token: string; name?: string }>();
      if (!token) return c.json({ code: "bad_request", message: "token required" }, 400);
      const result = await Members.acceptInvite(getDb(), token, name);
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const result = await Members.listMembers(buildCtx(c));
      return c.json({ data: result });
    } catch (err) { return handleError(err, c); }
  })
  .post("/invite", rateLimit({ windowMs: 60_000, max: 5 }), async (c) => {
    try {
      const result = await Members.inviteMember(buildCtx(c), await c.req.json());
      void sendInviteEmail({
        to: result.email,
        role: result.role,
        token: result.token,
        adminOrigin: env.ADMIN_ORIGIN,
        resendApiKey: env.RESEND_API_KEY,
      });
      return c.json(result, 201);
    } catch (err) { return handleError(err, c); }
  })
  .get("/invites", async (c) => {
    try {
      const result = await Members.listInvites(buildCtx(c));
      return c.json({ data: result });
    } catch (err) { return handleError(err, c); }
  })
  .delete("/invites/:id", async (c) => {
    try {
      const result = await Members.revokeInvite(buildCtx(c), c.req.param("id"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .patch("/:userId", async (c) => {
    try {
      const { role } = await c.req.json<{ role: string }>();
      const result = await Members.updateMemberRole(buildCtx(c), c.req.param("userId"), role);
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .delete("/:userId", async (c) => {
    try {
      const result = await Members.removeMember(buildCtx(c), c.req.param("userId"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
