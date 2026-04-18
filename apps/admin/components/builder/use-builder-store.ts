"use client";

import { create } from "zustand";
import type { TBlockTree } from "@repo/schemas";

type Block = TBlockTree["blocks"][number];

interface BuilderState {
  blocks: Block[];
  selectedId: string | null;
  past: Block[][];
  future: Block[][];
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;

  setBlocks: (blocks: Block[], pushHistory?: boolean) => void;
  selectBlock: (id: string | null) => void;
  updateBlock: (id: string, props: Record<string, unknown>) => void;
  addBlock: (block: Block) => void;
  removeBlock: (id: string) => void;
  reorder: (activeId: string, overId: string) => void;
  undo: () => void;
  redo: () => void;
  markSaving: (saving: boolean) => void;
  markSaved: () => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  selectedId: null,
  past: [],
  future: [],
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,

  setBlocks(blocks, pushHistory = false) {
    const state = get();
    if (pushHistory) {
      set({ past: [...state.past, state.blocks], future: [], blocks, isDirty: true });
    } else {
      set({ blocks, isDirty: false });
    }
  },

  selectBlock(id) {
    set({ selectedId: id });
  },

  updateBlock(id, props) {
    const state = get();
    const blocks = state.blocks.map((b) =>
      b.id === id ? { ...b, props: { ...(b as { props: Record<string, unknown> }).props, ...props } } : b,
    ) as Block[];
    set({ past: [...state.past, state.blocks], future: [], blocks, isDirty: true });
  },

  addBlock(block) {
    const state = get();
    const blocks = [...state.blocks, block] as Block[];
    set({ past: [...state.past, state.blocks], future: [], blocks, isDirty: true });
  },

  removeBlock(id) {
    const state = get();
    const blocks = state.blocks.filter((b) => b.id !== id) as Block[];
    const selectedId = state.selectedId === id ? null : state.selectedId;
    set({ past: [...state.past, state.blocks], future: [], blocks, selectedId, isDirty: true });
  },

  reorder(activeId, overId) {
    const state = get();
    const oldIndex = state.blocks.findIndex((b) => b.id === activeId);
    const newIndex = state.blocks.findIndex((b) => b.id === overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
    const blocks = [...state.blocks] as Block[];
    const [moved] = blocks.splice(oldIndex, 1);
    if (moved) blocks.splice(newIndex, 0, moved);
    set({ past: [...state.past, state.blocks], future: [], blocks, isDirty: true });
  },

  undo() {
    const state = get();
    if (state.past.length === 0) return;
    const past = [...state.past];
    const blocks = past.pop()!;
    set({ past, future: [state.blocks, ...state.future], blocks: blocks as Block[], isDirty: true });
  },

  redo() {
    const state = get();
    if (state.future.length === 0) return;
    const future = [...state.future];
    const blocks = future.shift()!;
    set({ past: [...state.past, state.blocks], future, blocks: blocks as Block[], isDirty: true });
  },

  markSaving(saving) {
    set({ isSaving: saving });
  },

  markSaved() {
    set({ isSaving: false, isDirty: false, lastSavedAt: Date.now() });
  },
}));
