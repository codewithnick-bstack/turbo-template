import Link from "next/link";
import { NavClient } from "./nav-client";
import { SearchBar } from "./search-bar";
import { LocaleSwitcher } from "@/components/locale-switcher";

const NAV = [
  { label: "Overview", items: [
    { href: "/", label: "Dashboard" },
  ]},
  { label: "Content", items: [
    { href: "/sites", label: "Sites" },
    { href: "/templates", label: "Templates" },
    { href: "/media", label: "Media" },
  ]},
  { label: "Agency", items: [
    { href: "/agency", label: "Client Workspaces" },
  ]},
  { label: "Settings", items: [
    { href: "/settings/members", label: "Members" },
    { href: "/settings/branding", label: "Branding" },
    { href: "/settings/billing", label: "Billing" },
    { href: "/settings/compliance", label: "Compliance" },
    { href: "/webhooks", label: "Webhooks" },
    { href: "/settings/api-keys", label: "API Keys" },
    { href: "/settings/developers", label: "Developer Platform" },
    { href: "/settings/audit-log", label: "Audit Log" },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--primary-foreground)]"
      >
        Skip to main content
      </a>
      <aside
        aria-label="Sidebar navigation"
        className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--background)] px-4 py-6 flex flex-col"
      >
        <Link href="/" className="flex items-center gap-2 mb-4" aria-label="Platform home">
          <p className="text-sm font-bold tracking-tight text-[var(--foreground)]">Platform</p>
        </Link>
        <SearchBar />
        <nav aria-label="Main navigation" className="mt-4 flex-1">
          <NavClient nav={NAV} />
        </nav>
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <LocaleSwitcher />
        </div>
      </aside>
      <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto px-8 py-8">{children}</main>
    </div>
  );
}
