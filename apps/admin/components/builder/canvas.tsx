"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useBuilderStore } from "./use-builder-store";
import type { TBlockTree } from "@repo/schemas";

type Block = TBlockTree["blocks"][number];

function BlockCard({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const removeBlock = useBuilderStore((s) => s.removeBlock);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const isSelected = selectedId === block.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectBlock(block.id)}
      className={`group relative rounded-lg border bg-white p-3 cursor-pointer transition-all ${
        isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-neutral-200 hover:border-neutral-300"
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-neutral-400 hover:text-neutral-600"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </button>
        <span className="flex-1 text-sm font-medium capitalize text-neutral-700">{block.type}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            removeBlock(block.id);
          }}
          className="hidden group-hover:flex items-center text-red-400 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <BlockPreview block={block} />
    </div>
  );
}

function BlockPreview({ block }: { block: Block }) {
  const b = block as { type: string; props: Record<string, unknown> };
  const preview =
    "heading" in b.props
      ? String(b.props.heading)
      : "html" in b.props
        ? String(b.props.html).replace(/<[^>]+>/g, "").slice(0, 60)
        : b.type;
  return <p className="mt-1 text-xs text-neutral-400 truncate">{preview}</p>;
}

export function BuilderCanvas() {
  const blocks = useBuilderStore((s) => s.blocks);
  const reorder = useBuilderStore((s) => s.reorder);
  const selectBlock = useBuilderStore((s) => s.selectBlock);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id));
    }
  }

  if (blocks.length === 0) {
    return (
      <div
        className="flex-1 flex items-center justify-center text-neutral-400 text-sm cursor-pointer"
        onClick={() => selectBlock(null)}
      >
        Add blocks from the left panel
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-neutral-50" onClick={() => selectBlock(null)}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="mx-auto max-w-2xl space-y-2">
            {blocks.map((block) => (
              <div key={block.id} onClick={(e) => e.stopPropagation()}>
                <BlockCard block={block} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
