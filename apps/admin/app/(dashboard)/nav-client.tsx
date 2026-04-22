"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavGroup = { label: string; items: { href: string; label: string }[] };

export function NavClient({ nav }: { nav: NavGroup[]; pathname?: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="space-y-4 text-sm">
      {nav.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {group.label}
          </p>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded px-3 py-2 transition-colors ${
                isActive(item.href)
                  ? "bg-[var(--border)] font-medium text-[var(--foreground)]"
                  : "hover:bg-[var(--border)] text-[var(--foreground)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
