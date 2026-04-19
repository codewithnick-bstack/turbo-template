"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function RemoveMemberButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!confirm("Remove this member from the workspace?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/members/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Member removed");
      router.refresh();
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="text-xs text-red-500 hover:underline disabled:opacity-50"
    >
      {loading ? "…" : "Remove"}
    </button>
  );
}

export function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!confirm("Revoke this invitation?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/members/invites/${inviteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Invitation revoked");
      router.refresh();
    } catch {
      toast.error("Failed to revoke invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="text-xs text-red-500 hover:underline disabled:opacity-50"
    >
      {loading ? "…" : "Revoke"}
    </button>
  );
}
