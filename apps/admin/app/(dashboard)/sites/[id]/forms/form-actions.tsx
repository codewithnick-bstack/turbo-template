"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteFormButton({ formId }: { formId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this form and all its submissions? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/forms/${formId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
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
