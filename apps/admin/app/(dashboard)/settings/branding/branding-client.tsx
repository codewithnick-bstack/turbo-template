"use client";

import { useState } from "react";
import type { TBranding } from "@repo/sdk";

export function BrandingClient({ initial }: { initial: TBranding }) {
  const [form, setForm] = useState<TBranding>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update(key: keyof TBranding, value: string) {
    setForm((f) => ({ ...f, [key]: value || undefined }));
    setStatus("idle");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/branding", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }

  const primary = form.primaryColor ?? "#4f46e5";
  const accent = form.accentColor ?? "#06b6d4";

  return (
    <div className="space-y-8">
      {/* Live preview */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] bg-[var(--border)]/20 border-b border-[var(--border)]">
          Branding preview
        </div>
        <div className="p-6 flex gap-6 items-start flex-wrap">
          {/* Logo preview */}
          <div className="flex flex-col items-center gap-2">
            {form.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logoUrl} alt="Logo" className="h-12 object-contain" />
            ) : (
              <div
                className="h-12 px-4 flex items-center rounded font-bold text-white text-sm"
                style={{ backgroundColor: primary }}
              >
                Your Logo
              </div>
            )}
            <span className="text-xs text-[var(--muted-foreground)]">Logo</span>
          </div>

          {/* Color swatches */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-full border border-[var(--border)]" style={{ backgroundColor: primary }} />
              <span className="text-xs text-[var(--muted-foreground)]">Primary</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="h-10 w-10 rounded-full border border-[var(--border)]" style={{ backgroundColor: accent }} />
              <span className="text-xs text-[var(--muted-foreground)]">Accent</span>
            </div>
          </div>

          {/* Mock button */}
          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded text-sm text-white font-medium"
              style={{ backgroundColor: primary }}
            >
              Primary button
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded text-sm text-white font-medium"
              style={{ backgroundColor: accent }}
            >
              Accent button
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-5">
        <section>
          <h2 className="text-sm font-semibold mb-3 text-[var(--muted-foreground)] uppercase tracking-wide">Identity</h2>
          <div className="space-y-4">
            <Field label="Logo URL" value={form.logoUrl ?? ""} onChange={(v) => update("logoUrl", v)} placeholder="https://…/logo.png" />
            <Field label="Favicon URL" value={form.faviconUrl ?? ""} onChange={(v) => update("faviconUrl", v)} placeholder="https://…/favicon.ico" />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-3 text-[var(--muted-foreground)] uppercase tracking-wide">Colors</h2>
          <div className="grid grid-cols-2 gap-4">
            <ColorField label="Primary Color" value={form.primaryColor ?? ""} onChange={(v) => update("primaryColor", v)} />
            <ColorField label="Accent Color" value={form.accentColor ?? ""} onChange={(v) => update("accentColor", v)} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-3 text-[var(--muted-foreground)] uppercase tracking-wide">Contact & Legal</h2>
          <div className="space-y-4">
            <Field label="Support Email" value={form.supportEmail ?? ""} onChange={(v) => update("supportEmail", v)} placeholder="support@yourdomain.com" />
            <Field label="Privacy Policy URL" value={form.privacyUrl ?? ""} onChange={(v) => update("privacyUrl", v)} placeholder="https://…/privacy" />
            <Field label="Terms of Service URL" value={form.termsUrl ?? ""} onChange={(v) => update("termsUrl", v)} placeholder="https://…/terms" />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold mb-3 text-[var(--muted-foreground)] uppercase tracking-wide">Custom CSS</h2>
          <textarea
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono h-32 bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            value={form.customCss ?? ""}
            onChange={(e) => update("customCss", e.target.value)}
            placeholder=":root { --primary: #4f46e5; }"
          />
        </section>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded bg-[var(--primary)] px-5 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {status === "saving" ? "Saving…" : "Save branding"}
          </button>
          {status === "saved" && <span className="text-green-600 text-sm">Saved!</span>}
          {status === "error" && <span className="text-red-600 text-sm">Save failed.</span>}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[var(--border)] rounded bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || "#4f46e5"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded border border-[var(--border)] cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#4f46e5"
          pattern="^#[0-9a-fA-F]{6}$"
          className="flex-1 border border-[var(--border)] rounded bg-[var(--background)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>
    </div>
  );
}
