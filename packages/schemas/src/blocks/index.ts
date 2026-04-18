import { z } from "zod";

const baseBlock = z.object({
  id: z.string().min(1),
  children: z.array(z.lazy(() => Block)).optional(),
});

export const HeroBlock = baseBlock.extend({
  type: z.literal("hero"),
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().min(1).max(200),
    subheading: z.string().max(400).optional(),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
    mediaId: z.string().optional(),
  }),
});

export const FeaturesBlock = baseBlock.extend({
  type: z.literal("features"),
  props: z.object({
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

export const CtaBlock = baseBlock.extend({
  type: z.literal("cta"),
  props: z.object({
    heading: z.string(),
    description: z.string().optional(),
    primaryCtaLabel: z.string(),
    primaryCtaHref: z.string(),
    secondaryCtaLabel: z.string().optional(),
    secondaryCtaHref: z.string().optional(),
  }),
});

export const TestimonialsBlock = baseBlock.extend({
  type: z.literal("testimonials"),
  props: z.object({
    heading: z.string().optional(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          name: z.string(),
          company: z.string().optional(),
        }),
      )
      .min(1),
  }),
});

export const RichTextBlock = baseBlock.extend({
  type: z.literal("richtext"),
  props: z.object({
    html: z.string(),
  }),
});

export const FormBlock = baseBlock.extend({
  type: z.literal("form"),
  props: z.object({
    formId: z.string(),
    submitLabel: z.string().default("Submit"),
  }),
});

export const CustomBlock = baseBlock.extend({
  type: z.literal("custom"),
  props: z.record(z.unknown()),
});

export const Block: z.ZodType<unknown> = z.discriminatedUnion("type", [
  HeroBlock,
  FeaturesBlock,
  CtaBlock,
  TestimonialsBlock,
  RichTextBlock,
  FormBlock,
  CustomBlock,
]);

export const BlockTree = z.object({
  version: z.number().int().nonnegative().default(1),
  blocks: z.array(Block).default([]),
});

export type TBlockTree = z.infer<typeof BlockTree>;
