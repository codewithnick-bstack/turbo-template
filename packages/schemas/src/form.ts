import { z } from "zod";
import { Id, Tenanted, Timestamps } from "./common";

export const FormField = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(["text", "email", "textarea", "select", "checkbox", "phone"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

export const Form = z
  .object({
    id: Id,
    siteId: Id,
    name: z.string(),
    fields: z.array(FormField),
    captcha: z.boolean().default(true),
    deliverBy: z.object({
      email: z.array(z.string().email()).default([]),
      webhookUrl: z.string().url().optional(),
    }),
  })
  .merge(Tenanted)
  .merge(Timestamps);

export const FormSubmission = z
  .object({
    id: Id,
    formId: Id,
    data: z.record(z.unknown()),
    leadScore: z.number().min(0).max(1).nullable(),
    ipHashed: z.string().nullable(),
  })
  .merge(Tenanted)
  .merge(Timestamps);

export type TForm = z.infer<typeof Form>;
export type TFormSubmission = z.infer<typeof FormSubmission>;
