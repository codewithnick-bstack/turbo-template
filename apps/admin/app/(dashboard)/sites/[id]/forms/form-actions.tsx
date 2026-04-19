"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteFormButton({ formId }: { formId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this form and all its submissions? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${formId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Form deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete form");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:underline disabled:opacity-50"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
