import type { Metadata } from "next";
import Link from "next/link";
import { serverFetch } from "@/lib/api";
import type { Testimonial } from "@/lib/types";
import { TestimonialActions } from "./testimonial-actions";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  let testimonials: Testimonial[] = [];
  try {
    testimonials = await serverFetch<Testimonial[]>("/testimonials");
  } catch {
    // unauthenticated or unavailable
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Link
          href="/testimonials/new"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Add testimonial
        </Link>
      </div>

      {testimonials.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No testimonials yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-xl border border-[var(--border)] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{t.authorName}</p>
                  {t.company || t.role ? (
                    <p className="text-xs text-[var(--muted-foreground)]">{[t.role, t.company].filter(Boolean).join(" · ")}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {t.featured && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Featured</span>
                  )}
                  <Link
                    href={`/testimonials/${t.id}`}
                    className="text-xs text-[var(--primary)] hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-sm italic text-[var(--muted-foreground)]">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-3 flex gap-2">
                <TestimonialActions testimonialId={t.id} featured={t.featured} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
