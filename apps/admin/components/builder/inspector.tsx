"use client";

import { useBuilderStore } from "./use-builder-store";
import type { TBlockTree } from "@repo/schemas";

type Block = TBlockTree["blocks"][number];
type BlockWithProps = Block & { props: Record<string, unknown> };

function StringField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const cls =
    "w-full rounded border border-neutral-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none";
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{label}</span>
      {multiline ? (
        <textarea
          className={cls}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input type="text" className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function BlockInspectorFields({
  block,
  onUpdate,
}: {
  block: BlockWithProps;
  onUpdate: (props: Record<string, unknown>) => void;
}) {
  const props = block.props;

  function field(key: string) {
    const val = props[key];
    return typeof val === "string" ? val : "";
  }

  switch (block.type) {
    case "hero":
      return (
        <div className="space-y-3">
          <StringField
            label="Eyebrow"
            value={field("eyebrow")}
            onChange={(v) => onUpdate({ eyebrow: v })}
          />
          <StringField
            label="Heading"
            value={field("heading")}
            onChange={(v) => onUpdate({ heading: v })}
          />
          <StringField
            label="Subheading"
            value={field("subheading")}
            onChange={(v) => onUpdate({ subheading: v })}
            multiline
          />
          <StringField
            label="CTA Label"
            value={field("ctaLabel")}
            onChange={(v) => onUpdate({ ctaLabel: v })}
          />
          <StringField
            label="CTA Href"
            value={field("ctaHref")}
            onChange={(v) => onUpdate({ ctaHref: v })}
          />
        </div>
      );
    case "cta":
      return (
        <div className="space-y-3">
          <StringField
            label="Heading"
            value={field("heading")}
            onChange={(v) => onUpdate({ heading: v })}
          />
          <StringField
            label="Description"
            value={field("description")}
            onChange={(v) => onUpdate({ description: v })}
            multiline
          />
          <StringField
            label="Primary CTA Label"
            value={field("primaryCtaLabel")}
            onChange={(v) => onUpdate({ primaryCtaLabel: v })}
          />
          <StringField
            label="Primary CTA Href"
            value={field("primaryCtaHref")}
            onChange={(v) => onUpdate({ primaryCtaHref: v })}
          />
        </div>
      );
    case "richtext":
      return (
        <div className="space-y-3">
          <StringField
            label="HTML Content"
            value={field("html")}
            onChange={(v) => onUpdate({ html: v })}
            multiline
          />
        </div>
      );
    case "form":
      return (
        <div className="space-y-3">
          <StringField
            label="Form ID"
            value={field("formId")}
            onChange={(v) => onUpdate({ formId: v })}
          />
          <StringField
            label="Submit Label"
            value={field("submitLabel")}
            onChange={(v) => onUpdate({ submitLabel: v })}
          />
        </div>
      );
    default:
      return (
        <pre className="text-xs bg-neutral-50 rounded p-2 overflow-auto">
          {JSON.stringify(props, null, 2)}
        </pre>
      );
  }
}

export function Inspector() {
  const selectedId = useBuilderStore((s) => s.selectedId);
  const blocks = useBuilderStore((s) => s.blocks);
  const updateBlock = useBuilderStore((s) => s.updateBlock);

  const block = blocks.find((b) => b.id === selectedId) as BlockWithProps | undefined;

  if (!block) {
    return (
      <div className="w-64 shrink-0 border-l border-neutral-200 bg-white p-4 flex items-start justify-center">
        <p className="text-sm text-neutral-400">Select a block to edit</p>
      </div>
    );
  }

  return (
    <div className="w-64 shrink-0 border-l border-neutral-200 bg-white p-4 overflow-y-auto">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {block.type} — Properties
      </p>
      <BlockInspectorFields block={block} onUpdate={(props) => updateBlock(block.id, props)} />
    </div>
  );
}
