"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Globe, Loader2, PenLine, LayoutTemplate, Rocket } from "lucide-react";

type Step = "template" | "site" | "page" | "domain" | "done";

const STEPS: Array<{ id: Step; label: string }> = [
  { id: "template", label: "Template" },
  { id: "site", label: "Create Site" },
  { id: "page", label: "Add Page" },
  { id: "domain", label: "Domain" },
  { id: "done", label: "Done" },
];

type Template = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  category: string;
};

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("template");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [siteName, setSiteName] = useState("");
  const [siteSlug, setSiteSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("Home");
  const [domain, setDomain] = useState("");

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d: { data?: Template[] }) => {
        if (d.data?.length) setTemplates(d.data);
      })
      .catch(() => {/* silently skip if unavailable */});
  }, []);

  async function handleTemplateNext() {
    setStep("site");
  }

  async function createSite() {
    setLoading(true);
    setError(null);
    try {
      let data: { id: string };
      if (selectedTemplate) {
        const res = await fetch(`/api/templates/${selectedTemplate}/use`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: siteName, slug: siteSlug }),
        });
        if (!res.ok) throw new Error("Failed to create site from template");
        data = (await res.json()) as { id: string };
        setSiteId(data.id);
        setStep("domain");
      } else {
        const res = await fetch("/api/sites", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name: siteName, slug: siteSlug }),
        });
        if (!res.ok) throw new Error("Failed to create site");
        data = (await res.json()) as { id: string };
        setSiteId(data.id);
        setStep("page");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function createPage() {
    if (!siteId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          siteId,
          title: pageTitle,
          slug: pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        }),
      });
      if (!res.ok) throw new Error("Failed to create page");
      setStep("domain");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function bindDomain() {
    if (!siteId || !domain) { setStep("done"); return; }
    setLoading(true);
    try {
      await fetch(`/api/sites/${siteId}/domain`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hostname: domain }),
      });
    } catch {/* best effort */}
    setLoading(false);
    setStep("done");
  }

  const currentIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-center">Welcome!</h1>
      <p className="mt-1 text-center text-sm text-[var(--muted-foreground)]">
        Get your first site live in a few steps.
      </p>

      {/* Progress bar */}
      <div className="mt-6 flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                i < currentIdx
                  ? "bg-green-500 text-white"
                  : i === currentIdx
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--border)] text-[var(--muted-foreground)]"
              }`}
            >
              {i < currentIdx ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className="text-xs text-[var(--muted-foreground)] hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        {/* Step 1: Template selection */}
        {step === "template" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <LayoutTemplate size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Start from a template</h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Pick a template to get started faster, or start blank.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  selectedTemplate === null
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--border)] hover:border-[var(--primary)]/50"
                }`}
              >
                <p className="text-sm font-medium">Blank site</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Start from scratch</p>
              </button>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selectedTemplate === t.id
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  }`}
                >
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5 capitalize">{t.category}</p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleTemplateNext}
              className="w-full rounded bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Site details */}
        {step === "site" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Name your site</h2>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Site name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => {
                  setSiteName(e.target.value);
                  setSiteSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, ""));
                }}
                placeholder="My Awesome Business"
                className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL slug</label>
              <input
                type="text"
                value={siteSlug}
                onChange={(e) => setSiteSlug(e.target.value)}
                placeholder="my-awesome-business"
                className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("template")}
                className="rounded border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--border)] transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={createSite}
                disabled={loading || !siteName || !siteSlug}
                className="flex-1 flex items-center justify-center gap-2 rounded bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {selectedTemplate ? "Create from template" : "Create site"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Homepage (only for blank sites) */}
        {step === "page" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PenLine size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Add your homepage</h2>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Page title</label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Home"
                className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <button
              type="button"
              onClick={createPage}
              disabled={loading || !pageTitle}
              className="w-full flex items-center justify-center gap-2 rounded bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Add page
            </button>
          </div>
        )}

        {/* Step 4: Domain */}
        {step === "domain" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Connect a custom domain</h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">Optional — you can skip this and do it later.</p>
            <div>
              <label className="block text-sm font-medium mb-1">Domain</label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="www.yourdomain.com"
                className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("done")}
                className="flex-1 rounded border border-[var(--border)] py-2.5 text-sm hover:bg-[var(--border)] transition-colors"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={bindDomain}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Connect
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Done */}
        {step === "done" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Rocket size={48} className="text-[var(--primary)]" />
            </div>
            <h2 className="text-xl font-bold">You&apos;re all set!</h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Your site is ready. Head to the dashboard to start building.
            </p>
            <button
              type="button"
              onClick={() => router.push(siteId ? `/sites/${siteId}` : "/sites")}
              className="w-full rounded bg-[var(--primary)] py-2.5 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
            >
              Go to my site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
