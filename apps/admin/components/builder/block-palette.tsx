"use client";

import { nanoid } from "nanoid";
import type { TBlockTree } from "@repo/schemas";
import { useBuilderStore } from "./use-builder-store";

type Block = TBlockTree["blocks"][number];

const BLOCK_TYPES: Array<{ type: string; label: string; defaultProps: Record<string, unknown> }> = [
  {
    type: "hero",
    label: "Hero",
    defaultProps: { heading: "Your Heading", subheading: "Your subheading text." },
  },
  {
    type: "features",
    label: "Features",
    defaultProps: {
      heading: "Features",
      items: [{ title: "Feature 1", description: "Description" }],
    },
  },
  {
    type: "cta",
    label: "Call to Action",
    defaultProps: {
      heading: "Ready to get started?",
      primaryCtaLabel: "Get Started",
      primaryCtaHref: "#",
    },
  },
  {
    type: "testimonials",
    label: "Testimonials",
    defaultProps: {
      items: [{ quote: "Great product!", name: "Jane Doe", company: "Acme Inc" }],
    },
  },
  {
    type: "richtext",
    label: "Rich Text",
    defaultProps: { html: "<p>Start typing...</p>" },
  },
  {
    type: "form",
    label: "Form",
    defaultProps: { formId: "", submitLabel: "Submit" },
  },
];

export function BlockPalette() {
  const addBlock = useBuilderStore((s) => s.addBlock);

  function handleAdd(item: (typeof BLOCK_TYPES)[number]) {
    const block = {
      id: nanoid(),
      type: item.type,
      props: item.defaultProps,
    } as unknown as Block;
    addBlock(block);
  }

  return (
    <div className="w-56 shrink-0 border-r border-neutral-200 bg-white p-3 overflow-y-auto">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Blocks</p>
      <ul className="space-y-1">
        {BLOCK_TYPES.map((item) => (
          <li key={item.type}>
            <button
              type="button"
              onClick={() => handleAdd(item)}
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-left text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
