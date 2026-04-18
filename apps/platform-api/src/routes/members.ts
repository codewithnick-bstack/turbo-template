import { Hono } from "hono";
import * as Members from "@repo/core/members";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const membersRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const result = await Members.listMembers(buildCtx(c));
      return c.json({ data: result });
    } catch (err) { return handleError(err, c); }
  })
  .post("/invite", async (c) => {
    try {
      const result = await Members.inviteMember(buildCtx(c), await c.req.json());
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
