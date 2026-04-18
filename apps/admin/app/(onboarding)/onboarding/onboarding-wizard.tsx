"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Globe, Loader2, PenLine, Rocket } from "lucide-react";

type Step = "site" | "page" | "domain" | "done";

const STEPS: Array<{ id: Step; label: string; icon: React.ReactNode }> = [
  { id: "site", label: "Create Site", icon: <Globe size={20} /> },
  { id: "page", label: "Add Page", icon: <PenLine size={20} /> },
  { id: "domain", label: "Connect Domain", icon: <Globe size={20} /> },
  { id: "done", label: "Launch", icon: <Rocket size={20} /> },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("site");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);

  const [siteName, setSiteName] = useState("");
  const [siteSlug, setSiteSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [domain, setDomain] = useState("");

  async function createSite() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: siteName, slug: siteSlug }),
      });
      if (!res.ok) throw new Error("Failed to create site");
      const data = (await res.json()) as { id: string };
      setSiteId(data.id);
      setStep("page");
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
        headers: { "Content-Type": "application/json" },
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
    if (!siteId || !domain) {
      setStep("done");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await fetch(`/api/sites/${siteId}/domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostname: domain }),
      });
      setStep("done");
    } catch {
      setStep("done");
    } finally {
      setLoading(false);
    }
  }

  const currentIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-center">Welcome!</h1>
      <p className="mt-2 text-center text-sm text-neutral-500">
        Let&apos;s get your site live in a few steps.
      </p>

      {/* Progress */}
      <div className="mt-6 flex items-center justify-between gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-sm transition-colors ${
                i < currentIdx
                  ? "bg-green-500"
                  : i === currentIdx
                    ? "bg-blue-600"
                    : "bg-neutral-200 text-neutral-400"
              }`}
            >
              {i < currentIdx ? <CheckCircle size={16} /> : <span>{i + 1}</span>}
            </div>
            <span className="text-xs text-neutral-500 hidden sm:block">{s.label}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-8">
        {step === "site" && (
          <div className="space-y-4">
            <h2 className="font-semibold">Create your first site</h2>
            <label className="block space-y-1">
              <span className="text-sm text-neutral-600">Site name</span>
              <input
                type="text"
                value={siteName}
                onChange={(e) => {
                  setSiteName(e.target.value);
                  setSiteSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                }}
                placeholder="My Awesome Business"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm text-neutral-600">URL slug</span>
              <input
                type="text"
                value={siteSlug}
                onChange={(e) => setSiteSlug(e.target.value)}
                placeholder="my-awesome-business"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none font-mono"
              />
            </label>
            <button
              type="button"
              onClick={createSite}
              disabled={loading || !siteName || !siteSlug}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Site
            </button>
          </div>
        )}

        {step === "page" && (
          <div className="space-y-4">
            <h2 className="font-semibold">Add your homepage</h2>
            <label className="block space-y-1">
              <span className="text-sm text-neutral-600">Page title</span>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="Home"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={createPage}
              disabled={loading || !pageTitle}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Page
            </button>
          </div>
        )}

        {step === "domain" && (
          <div className="space-y-4">
            <h2 className="font-semibold">Connect a custom domain</h2>
            <p className="text-sm text-neutral-500">Optional — you can skip this and do it later.</p>
            <label className="block space-y-1">
              <span className="text-sm text-neutral-600">Domain</span>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="www.yourdomain.com"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none font-mono"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("done")}
                className="flex-1 rounded-lg border border-neutral-200 py-2.5 text-sm hover:bg-neutral-50"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={bindDomain}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Connect
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold">You&apos;re all set!</h2>
            <p className="text-sm text-neutral-500">
              Your site is ready. Head to the dashboard to start building.
            </p>
            <button
              type="button"
              onClick={() => router.push(siteId ? `/sites/${siteId}` : "/sites")}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
