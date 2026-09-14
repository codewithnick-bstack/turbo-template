"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientApiUrl } from "@/lib/api";

type Props = { contactId: string; status: string };

export function ContactActions({ contactId, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(action: "read" | "archive") {
    setLoading(true);
    try {
      const res = await fetch(`${clientApiUrl}/api/v1/contacts/${contactId}/${action}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(action === "read" ? "Marked as read" : "Archived");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {status === "new" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("read")}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
        >
          Mark read
        </button>
      )}
      {status !== "archived" && (
        <button
          disabled={loading}
          onClick={() => updateStatus("archive")}
          className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
        >
          Archive
        </button>
      )}
    </>
  );
}
