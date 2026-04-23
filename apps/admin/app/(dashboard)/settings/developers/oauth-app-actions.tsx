"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/toast";

export function DeleteOAuthAppButton({ appId, appName }: { appId: string; appName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleDelete() {
    if (!confirm(`Delete OAuth app "${appName}"? All grants will be revoked.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/developers/apps/${appId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: "App deleted", description: appName });
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Failed to delete app.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
