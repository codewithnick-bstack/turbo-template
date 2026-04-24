"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientApiUrl } from "@/lib/api";
import type { Testimonial } from "@/lib/types";

type Props = { testimonial?: Testimonial };

export function TestimonialForm({ testimonial }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    authorName: testimonial?.authorName ?? "",
    company: testimonial?.company ?? "",
    role: testimonial?.role ?? "",
    quote: testimonial?.quote ?? "",
    rating: String(testimonial?.rating ?? 5),
    featured: testimonial?.featured ?? false,
  });

  const set = (k: keyof Omit<typeof values, "featured" | "rating">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = testimonial ? "PATCH" : "POST";
      const url = testimonial
        ? `${clientApiUrl}/api/v1/testimonials/${testimonial.id}`
        : `${clientApiUrl}/api/v1/testimonials`;
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...values, rating: Number(values.rating) }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(testimonial ? "Updated" : "Added");
      router.push("/testimonials");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTestimonial() {
    if (!testimonial || !confirm("Delete this testimonial?")) return;
    setSaving(true);
    try {
      await fetch(`${clientApiUrl}/api/v1/testimonials/${testimonial.id}`, { method: "DELETE", credentials: "include" });
      toast.success("Deleted");
      router.push("/testimonials");
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
        <label htmlFor="t-authorName" className="mb-1 block text-sm font-medium">Author name</label>
        <input id="t-authorName" className="input" required value={values.authorName} onChange={set("authorName")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="t-company" className="mb-1 block text-sm font-medium">Company</label>
          <input id="t-company" className="input" value={values.company} onChange={set("company")} />
        </div>
        <div>
          <label htmlFor="t-role" className="mb-1 block text-sm font-medium">Role</label>
          <input id="t-role" className="input" value={values.role} onChange={set("role")} />
        </div>
      </div>
      <div>
        <label htmlFor="t-quote" className="mb-1 block text-sm font-medium">Quote</label>
        <textarea id="t-quote" className="input" required rows={3} value={values.quote} onChange={set("quote")} />
      </div>
      <div>
        <label htmlFor="t-rating" className="mb-1 block text-sm font-medium">Rating (1-5)</label>
        <input
          id="t-rating"
          className="input"
          type="number"
          min={1}
          max={5}
          value={values.rating}
          onChange={(e) => setValues((v) => ({ ...v, rating: e.target.value }))}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(e) => setValues((v) => ({ ...v, featured: e.target.checked }))}
        />
        Featured on homepage
      </label>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {testimonial && (
          <button
            type="button"
            disabled={saving}
            onClick={deleteTestimonial}
            className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
