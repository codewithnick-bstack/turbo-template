import { createHash } from "node:crypto";
import { eq, and, desc } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";
import { emitEvent } from "../events";
import { checkSpam } from "./spam";
import { deliverFormSubmission } from "./deliver";

export const createFormContract = defineContract({
  operation: "forms.create",
  description: "Create a new form definition attached to a site.",
  http: { method: "POST", path: "/v1/forms" },
  mcp: { tool: "create_form" },
  webhook: { event: "form.created" },
});

export const listFormsContract = defineContract({
  operation: "forms.list",
  description: "List forms for a site.",
  idempotent: true,
  http: { method: "GET", path: "/v1/forms" },
  mcp: { tool: "list_forms" },
});

export const submitFormContract = defineContract({
  operation: "forms.submit",
  description: "Submit a form; persists submission and enqueues delivery.",
  http: { method: "POST", path: "/v1/forms/:id/submit" },
  mcp: { tool: "submit_form" },
  webhook: { event: "form.submitted" },
});

export const listFormSubmissionsContract = defineContract({
  operation: "forms.submissions.list",
  description: "List submissions for a form.",
  idempotent: true,
  http: { method: "GET", path: "/v1/forms/:id/submissions" },
  mcp: { tool: "list_form_submissions" },
});

const FormField = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(["text", "email", "textarea", "select", "checkbox", "phone"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

const CreateFormInput = z.object({
  siteId: z.string().uuid(),
  name: z.string().min(1),
  fields: z.array(FormField).min(1),
  captcha: z.boolean().default(true),
  deliverEmails: z.array(z.string().email()).default([]),
  deliverWebhookUrl: z.string().url().optional(),
});

const SubmitFormInput = z.object({
  formId: z.string().uuid(),
  data: z.record(z.unknown()),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  captchaToken: z.string().optional(),
});

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export async function createForm(ctx: ServiceContext, input: unknown) {
  const parsed = CreateFormInput.parse(input);
  const [row] = await ctx.db
    .insert(schema.forms)
    .values({
      tenantId: ctx.tenantId,
      siteId: parsed.siteId,
      name: parsed.name,
      fields: parsed.fields,
      captcha: parsed.captcha,
      deliverEmails: parsed.deliverEmails,
      deliverWebhookUrl: parsed.deliverWebhookUrl ?? null,
    })
    .returning();
  if (!row) throw new AppError("internal", "form insert returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "create",
    resourceKind: "form",
    resourceId: row.id,
    after: { name: row.name },
  });

  return row;
}

export async function listForms(ctx: ServiceContext, filter: { siteId: string }) {
  return ctx.db
    .select()
    .from(schema.forms)
    .where(and(eq(schema.forms.tenantId, ctx.tenantId), eq(schema.forms.siteId, filter.siteId)))
    .orderBy(desc(schema.forms.createdAt));
}

export async function getForm(ctx: ServiceContext, id: string) {
  const [row] = await ctx.db
    .select()
    .from(schema.forms)
    .where(and(eq(schema.forms.id, id), eq(schema.forms.tenantId, ctx.tenantId)))
    .limit(1);
  if (!row) throw new AppError("not_found", `form not found: ${id}`);
  return row;
}

export async function deleteForm(ctx: ServiceContext, id: string) {
  const current = await getForm(ctx, id);
  await ctx.db
    .delete(schema.forms)
    .where(and(eq(schema.forms.id, id), eq(schema.forms.tenantId, ctx.tenantId)));

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "delete",
    resourceKind: "form",
    resourceId: id,
    before: current as unknown as Record<string, unknown>,
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "form.deleted",
    payload: { formId: id, siteId: current.siteId },
  });

  return { deleted: id };
}

export async function submitForm(ctx: ServiceContext, input: unknown) {
  const parsed = SubmitFormInput.parse(input);

  const spamResult = await checkSpam({
    data: parsed.data as Record<string, unknown>,
    ipAddress: parsed.ipAddress,
    userAgent: parsed.userAgent,
    captchaToken: parsed.captchaToken,
  });
  if (spamResult.spam) {
    throw new AppError("unprocessable", `spam detected: ${spamResult.reason}`, {
      details: { reason: spamResult.reason },
    });
  }

  const [form] = await ctx.db
    .select()
    .from(schema.forms)
    .where(and(eq(schema.forms.id, parsed.formId), eq(schema.forms.tenantId, ctx.tenantId)))
    .limit(1);
  if (!form) throw new AppError("not_found", `form not found: ${parsed.formId}`);

  for (const field of form.fields) {
    if (field.required && parsed.data[field.name] === undefined) {
      throw new AppError("unprocessable", `missing required field: ${field.name}`, {
        details: { field: field.name },
      });
    }
  }

  const [row] = await ctx.db
    .insert(schema.formSubmissions)
    .values({
      tenantId: ctx.tenantId,
      formId: parsed.formId,
      data: parsed.data,
      ipHashed: parsed.ipAddress ? hashIp(parsed.ipAddress) : null,
      userAgent: parsed.userAgent ?? null,
    })
    .returning();
  if (!row) throw new AppError("internal", "submission insert returned no row");

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "form.submitted",
    payload: {
      formId: parsed.formId,
      submissionId: row.id,
      data: parsed.data,
    },
  });

  // Fire-and-forget delivery (email + webhook)
  void deliverFormSubmission(
    { emails: form.deliverEmails ?? [], webhookUrl: form.deliverWebhookUrl },
    {
      formName: form.name,
      submissionId: row.id,
      data: parsed.data as Record<string, unknown>,
      submittedAt: new Date(),
    },
  );

  return { id: row.id, ok: true };
}

export async function listFormSubmissions(
  ctx: ServiceContext,
  filter: { formId: string; limit?: number },
) {
  return ctx.db
    .select()
    .from(schema.formSubmissions)
    .where(
      and(
        eq(schema.formSubmissions.tenantId, ctx.tenantId),
        eq(schema.formSubmissions.formId, filter.formId),
      ),
    )
    .orderBy(desc(schema.formSubmissions.createdAt))
    .limit(Math.min(filter.limit ?? 50, 200));
}
