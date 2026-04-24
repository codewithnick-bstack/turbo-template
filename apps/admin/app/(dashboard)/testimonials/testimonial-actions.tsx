"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientApiUrl } from "@/lib/api";

type Props = { testimonialId: string; featured: boolean };

export function TestimonialActions({ testimonialId, featured }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleFeatured() {
    setLoading(true);
    try {
      const res = await fetch(`${clientApiUrl}/api/v1/testimonials/${testimonialId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ featured: !featured }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(featured ? "Removed from featured" : "Marked as featured");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      disabled={loading}
      onClick={toggleFeatured}
      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
    >
      {featured ? "Unfeature" : "Feature"}
    </button>
  );
}
