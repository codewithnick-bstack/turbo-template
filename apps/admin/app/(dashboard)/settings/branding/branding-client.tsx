"use client";

import { useState } from "react";

type Branding = {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  customCss?: string;
  supportEmail?: string;
};

export function BrandingClient({ initial }: { initial: Branding }) {
  const [form, setForm] = useState<Branding>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update(key: keyof Branding, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
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

  return (
    <form onSubmit={save} className="space-y-5">
      <Field label="Logo URL" value={form.logoUrl ?? ""} onChange={(v) => update("logoUrl", v)} placeholder="https://…/logo.png" />
      <Field label="Favicon URL" value={form.faviconUrl ?? ""} onChange={(v) => update("faviconUrl", v)} placeholder="https://…/favicon.ico" />
      <Field label="Primary Color" value={form.primaryColor ?? ""} onChange={(v) => update("primaryColor", v)} placeholder="#4f46e5" />
      <Field label="Accent Color" value={form.accentColor ?? ""} onChange={(v) => update("accentColor", v)} placeholder="#06b6d4" />
      <Field label="Support Email" value={form.supportEmail ?? ""} onChange={(v) => update("supportEmail", v)} placeholder="support@yourdomain.com" />
      <div>
        <label className="block text-sm font-medium mb-1">Custom CSS</label>
        <textarea
          className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-mono h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={form.customCss ?? ""}
          onChange={(e) => update("customCss", e.target.value)}
          placeholder=":root { --brand: #4f46e5; }"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-medium"
        >
          {status === "saving" ? "Saving…" : "Save Branding"}
        </button>
        {status === "saved" && <span className="text-green-600 text-sm">Saved!</span>}
        {status === "error" && <span className="text-red-600 text-sm">Save failed.</span>}
      </div>
    </form>
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
        className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
