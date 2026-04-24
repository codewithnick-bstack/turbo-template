"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientApiUrl } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";

type Props = { settings: SiteSettings | null };

export function SettingsForm({ settings }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    businessName: settings?.businessName ?? "",
    tagline: settings?.tagline ?? "",
    email: settings?.email ?? "",
    phone: settings?.phone ?? "",
    address: settings?.address ?? "",
    seoTitle: settings?.seoTitle ?? "",
    seoDescription: settings?.seoDescription ?? "",
  });

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${clientApiUrl}/api/v1/settings`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Settings saved");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Business</h2>
        <div className="space-y-4">
          <Field label="Business name" htmlFor="settings-businessName">
            <input id="settings-businessName" className="input" value={values.businessName} onChange={set("businessName")} placeholder="Acme Studio" />
          </Field>
          <Field label="Tagline" htmlFor="settings-tagline">
            <input id="settings-tagline" className="input" value={values.tagline} onChange={set("tagline")} placeholder="Short description" />
          </Field>
          <Field label="Contact email" htmlFor="settings-email">
            <input id="settings-email" className="input" type="email" value={values.email} onChange={set("email")} placeholder="hello@example.com" />
          </Field>
          <Field label="Phone" htmlFor="settings-phone">
            <input id="settings-phone" className="input" value={values.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" />
          </Field>
          <Field label="Address" htmlFor="settings-address">
            <input id="settings-address" className="input" value={values.address} onChange={set("address")} placeholder="123 Main St, City, State" />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">SEO</h2>
        <div className="space-y-4">
          <Field label="SEO title" htmlFor="settings-seoTitle">
            <input id="settings-seoTitle" className="input" value={values.seoTitle} onChange={set("seoTitle")} placeholder="Page title for search engines" />
          </Field>
          <Field label="SEO description" htmlFor="settings-seoDescription">
            <textarea
              id="settings-seoDescription"
              className="input"
              value={values.seoDescription}
              onChange={set("seoDescription")}
              placeholder="Brief description (120-155 characters)"
              rows={3}
            />
          </Field>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
