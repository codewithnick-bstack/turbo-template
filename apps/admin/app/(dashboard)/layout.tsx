import Link from "next/link";
import { NavClient } from "./nav-client";
import { SearchBar } from "./search-bar";

const NAV = [
  { label: "Overview", items: [
    { href: "/", label: "Dashboard" },
  ]},
  { label: "Content", items: [
    { href: "/sites", label: "Sites" },
    { href: "/templates", label: "Templates" },
    { href: "/media", label: "Media" },
  ]},
  { label: "Settings", items: [
    { href: "/settings/members", label: "Members" },
    { href: "/settings/branding", label: "Branding" },
    { href: "/settings/billing", label: "Billing" },
    { href: "/settings/compliance", label: "Compliance" },
    { href: "/webhooks", label: "Webhooks" },
    { href: "/settings/api-keys", label: "API Keys" },
    { href: "/settings/audit-log", label: "Audit Log" },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--background)] px-4 py-6 flex flex-col">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <p className="text-sm font-bold tracking-tight text-[var(--foreground)]">Platform</p>
        </Link>
        <SearchBar />
        <div className="mt-4 flex-1">
          <NavClient nav={NAV} />
        </div>
      </aside>
      <main className="flex-1 overflow-auto px-8 py-8">{children}</main>
    </div>
  );
}
