import Link from "next/link";

const NAV = [
  { label: "Content", items: [
    { href: "/sites", label: "Sites" },
    { href: "/templates", label: "Templates" },
    { href: "/forms", label: "Forms" },
    { href: "/media", label: "Media" },
  ]},
  { label: "Settings", items: [
    { href: "/settings/members", label: "Members" },
    { href: "/settings/branding", label: "Branding" },
    { href: "/settings/billing", label: "Billing" },
    { href: "/settings/compliance", label: "Compliance" },
    { href: "/webhooks", label: "Webhooks" },
  ]},
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--background)] px-4 py-6">
        <Link href="/sites">
          <p className="mb-6 text-sm font-bold tracking-tight text-[var(--foreground)]">Platform</p>
        </Link>
        <nav className="space-y-4 text-sm">
          {NAV.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded px-3 py-2 hover:bg-[var(--border)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto px-8 py-8">{children}</main>
    </div>
  );
}
