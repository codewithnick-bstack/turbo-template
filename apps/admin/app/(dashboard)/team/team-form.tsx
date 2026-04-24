"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientApiUrl } from "@/lib/api";
import type { TeamMember } from "@/lib/types";

type Props = { member?: TeamMember };

export function TeamMemberForm({ member }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    name: member?.name ?? "",
    title: member?.title ?? "",
    bio: member?.bio ?? "",
    linkedinUrl: member?.linkedinUrl ?? "",
    twitterUrl: member?.twitterUrl ?? "",
    photoUrl: member?.photoUrl ?? "",
  });

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = member ? "PATCH" : "POST";
      const url = member ? `${clientApiUrl}/api/v1/team/${member.id}` : `${clientApiUrl}/api/v1/team`;
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(member ? "Member updated" : "Member added");
      router.push("/team");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMember() {
    if (!member || !confirm("Remove this team member?")) return;
    setSaving(true);
    try {
      await fetch(`${clientApiUrl}/api/v1/team/${member.id}`, { method: "DELETE", credentials: "include" });
      toast.success("Member removed");
      router.push("/team");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {(["name", "title", "bio", "linkedinUrl", "twitterUrl", "photoUrl"] as const).map((k) => {
        const fieldId = `team-field-${k}`;
        const labelText = k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
        return (
          <div key={k}>
            <label htmlFor={fieldId} className="mb-1 block text-sm font-medium">{labelText}</label>
            {k === "bio" ? (
              <textarea id={fieldId} className="input" value={values[k]} onChange={set(k)} rows={3} />
            ) : (
              <input id={fieldId} className="input" value={values[k]} onChange={set(k)} required={k === "name" || k === "title"} />
            )}
          </div>
        );
      })}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {member && (
          <button
            type="button"
            disabled={saving}
            onClick={deleteMember}
            className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
