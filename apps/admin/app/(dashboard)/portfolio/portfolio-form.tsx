"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientApiUrl } from "@/lib/api";
import type { PortfolioEntry } from "@/lib/types";

type Props = { entry?: PortfolioEntry };

export function PortfolioEntryForm({ entry }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    title: entry?.title ?? "",
    client: entry?.client ?? "",
    description: entry?.description ?? "",
    coverImageUrl: entry?.coverImageUrl ?? "",
    images: entry?.images ?? [],
    url: entry?.url ?? "",
    tags: entry?.tags.join(", ") ?? "",
    status: entry?.status ?? "draft",
  });
  const [newImageUrl, setNewImageUrl] = useState("");

  const set = (k: keyof Omit<typeof values, "status">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = entry ? "PATCH" : "POST";
      const url = entry
        ? `${clientApiUrl}/api/v1/portfolio/${entry.id}`
        : `${clientApiUrl}/api/v1/portfolio`;
      const payload = {
        ...values,
        tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: values.images.filter(Boolean),
      };
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(entry ? "Entry updated" : "Entry created");
      router.push("/portfolio");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry() {
    if (!entry || !confirm("Delete this portfolio entry?")) return;
    setSaving(true);
    try {
      await fetch(`${clientApiUrl}/api/v1/portfolio/${entry.id}`, { method: "DELETE", credentials: "include" });
      toast.success("Deleted");
      router.push("/portfolio");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="pf-title" className="mb-1 block text-sm font-medium">Title</label>
        <input id="pf-title" className="input" required value={values.title} onChange={set("title")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-client" className="mb-1 block text-sm font-medium">Client</label>
          <input id="pf-client" className="input" value={values.client} onChange={set("client")} />
        </div>
        <div>
          <label htmlFor="pf-url" className="mb-1 block text-sm font-medium">Project URL</label>
          <input id="pf-url" className="input" type="url" value={values.url} onChange={set("url")} placeholder="https://…" />
        </div>
      </div>
      <div>
        <label htmlFor="pf-description" className="mb-1 block text-sm font-medium">Description</label>
        <textarea id="pf-description" className="input" rows={4} value={values.description} onChange={set("description")} />
      </div>
      <div>
        <label htmlFor="pf-coverImageUrl" className="mb-1 block text-sm font-medium">Cover image URL</label>
        <input id="pf-coverImageUrl" className="input" type="url" value={values.coverImageUrl} onChange={set("coverImageUrl")} placeholder="https://…" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Gallery images</label>
        <div className="space-y-2">
          {values.images.map((img, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="url"
                className="input flex-1"
                value={img}
                onChange={(e) => setValues((v) => ({
                  ...v,
                  images: v.images.map((x, i) => i === idx ? e.target.value : x),
                }))}
                placeholder="https://…"
              />
              <button
                type="button"
                onClick={() => setValues((v) => ({
                  ...v,
                  images: v.images.filter((_, i) => i !== idx),
                }))}
                className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="url"
              className="input flex-1"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Add image URL"
            />
            <button
              type="button"
              onClick={() => {
                if (newImageUrl.trim()) {
                  setValues((v) => ({
                    ...v,
                    images: [...v.images, newImageUrl.trim()],
                  }));
                  setNewImageUrl("");
                }
              }}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:bg-[var(--muted)]"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="pf-tags" className="mb-1 block text-sm font-medium">Tags (comma-separated)</label>
        <input id="pf-tags" className="input" value={values.tags} onChange={set("tags")} placeholder="Web Design, Branding" />
      </div>
      <div>
        <label htmlFor="pf-status" className="mb-1 block text-sm font-medium">Status</label>
        <select
          id="pf-status"
          className="input"
          value={values.status}
          onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as "draft" | "published" }))}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {entry && (
          <button
            type="button"
            disabled={saving}
            onClick={deleteEntry}
            className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
