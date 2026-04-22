"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/toast";

export function RemoveClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleRemove() {
    if (!confirm(`Remove client workspace "${clientName}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/agency/clients/${clientId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: "Client removed", description: clientName });
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Failed to remove client workspace", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "Removing…" : "Remove"}
    </button>
  );
}
