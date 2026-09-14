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
    logoUrl: settings?.logoUrl ?? "",
    primaryColor: settings?.primaryColor ?? "",
    accentColor: settings?.accentColor ?? "",
    seoTitle: settings?.seoTitle ?? "",
    seoDescription: settings?.seoDescription ?? "",
    twitter: (settings?.socialLinks as Record<string, string> | null)?.twitter ?? "",
    linkedin: (settings?.socialLinks as Record<string, string> | null)?.linkedin ?? "",
    github: (settings?.socialLinks as Record<string, string> | null)?.github ?? "",
    instagram: (settings?.socialLinks as Record<string, string> | null)?.instagram ?? "",
  });

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const socialLinks: Record<string, string> = {};
      if (values.twitter) socialLinks.twitter = values.twitter;
      if (values.linkedin) socialLinks.linkedin = values.linkedin;
      if (values.github) socialLinks.github = values.github;
      if (values.instagram) socialLinks.instagram = values.instagram;

      const payload = {
        businessName: values.businessName || undefined,
        tagline: values.tagline || undefined,
        email: values.email || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        logoUrl: values.logoUrl || undefined,
        primaryColor: values.primaryColor || undefined,
        accentColor: values.accentColor || undefined,
        seoTitle: values.seoTitle || undefined,
        seoDescription: values.seoDescription || undefined,
        ...(Object.keys(socialLinks).length > 0 ? { socialLinks } : {}),
      };

      const res = await fetch(`${clientApiUrl}/api/v1/settings`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
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
    <form onSubmit={submit} className="space-y-8 max-w-2xl">
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
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Branding</h2>
        <div className="space-y-4">
          <Field label="Logo URL" htmlFor="settings-logoUrl" hint="Full HTTPS URL to your logo image">
            <input id="settings-logoUrl" className="input" type="url" value={values.logoUrl} onChange={set("logoUrl")} placeholder="https://example.com/logo.png" />
          </Field>
          <div className="flex gap-4">
            <Field label="Primary color" htmlFor="settings-primaryColor" className="flex-1">
              <div className="flex items-center gap-2">
                <input
                  id="settings-primaryColor"
                  className="input flex-1"
                  value={values.primaryColor}
                  onChange={set("primaryColor")}
                  placeholder="#6366f1"
                  pattern="^#[0-9a-fA-F]{6}$"
                />
                {values.primaryColor.match(/^#[0-9a-fA-F]{6}$/) && (
                  <span className="size-8 rounded-lg border border-[var(--border)] shrink-0" style={{ backgroundColor: values.primaryColor }} aria-hidden="true" />
                )}
              </div>
            </Field>
            <Field label="Accent color" htmlFor="settings-accentColor" className="flex-1">
              <div className="flex items-center gap-2">
                <input
                  id="settings-accentColor"
                  className="input flex-1"
                  value={values.accentColor}
                  onChange={set("accentColor")}
                  placeholder="#06b6d4"
                  pattern="^#[0-9a-fA-F]{6}$"
                />
                {values.accentColor.match(/^#[0-9a-fA-F]{6}$/) && (
                  <span className="size-8 rounded-lg border border-[var(--border)] shrink-0" style={{ backgroundColor: values.accentColor }} aria-hidden="true" />
                )}
              </div>
            </Field>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Social links</h2>
        <div className="space-y-4">
          <Field label="Twitter / X" htmlFor="settings-twitter">
            <input id="settings-twitter" className="input" type="url" value={values.twitter} onChange={set("twitter")} placeholder="https://x.com/yourhandle" />
          </Field>
          <Field label="LinkedIn" htmlFor="settings-linkedin">
            <input id="settings-linkedin" className="input" type="url" value={values.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/company/yourco" />
          </Field>
          <Field label="GitHub" htmlFor="settings-github">
            <input id="settings-github" className="input" type="url" value={values.github} onChange={set("github")} placeholder="https://github.com/yourorg" />
          </Field>
          <Field label="Instagram" htmlFor="settings-instagram">
            <input id="settings-instagram" className="input" type="url" value={values.instagram} onChange={set("instagram")} placeholder="https://instagram.com/yourhandle" />
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

function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">{label}</label>
      {hint && <p className="mb-1 text-xs text-[var(--muted-foreground)]">{hint}</p>}
      {children}
    </div>
  );
}
