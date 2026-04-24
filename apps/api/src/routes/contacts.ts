import { Router } from "express";
import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import type { Db } from "@repo/db";
import { CreateContactSchema } from "../schemas/contacts";
import * as contactsService from "../services/contacts";

const contactRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { code: "rate_limited", message: "Too many requests, please try again later." },
});

export function createContactsRouter(db: Db, authGuard: RequestHandler) {
  const router = Router();

  // Public submission (rate-limited)
  router.post("/", contactRateLimit, async (req, res) => {
    const data = CreateContactSchema.parse(req.body);
    const contact = await contactsService.createContact(db, data);
    res.status(201).json({ id: contact.id, message: "Your message has been received." });
  });

  // Auth-gated read/manage routes
  router.get("/", authGuard, async (req, res) => {
    const statusParam = req.query.status;
    const validStatuses = ["new", "read", "archived"] as const;
    const status = validStatuses.includes(statusParam as "new") ? (statusParam as "new" | "read" | "archived") : undefined;
    const contacts = await contactsService.listContacts(db, status ? { status } : {});
    res.json(contacts);
  });

  router.get("/:id", authGuard, async (req, res) => {
    const contact = await contactsService.getContact(db, String(req.params.id));
    res.json(contact);
  });

  router.post("/:id/read", authGuard, async (req, res) => {
    const contact = await contactsService.markContactRead(db, String(req.params.id));
    res.json(contact);
  });

  router.post("/:id/archive", authGuard, async (req, res) => {
    const contact = await contactsService.archiveContact(db, String(req.params.id));
    res.json(contact);
  });

  return router;
}
