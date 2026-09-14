import Link from "next/link";
import { NavClient } from "./nav-client";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  {
    label: "Content",
    items: [
      { href: "/blog", label: "Blog" },
      { href: "/team", label: "Team" },
      { href: "/testimonials", label: "Testimonials" },
      { href: "/portfolio", label: "Portfolio" },
    ],
  },
  {
    label: "Inbox",
    items: [
      { href: "/contacts", label: "Contacts" },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/settings", label: "Settings" },
      { href: "/ai", label: "AI Assistant" },
    ],
  },
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
        className="w-52 shrink-0 border-r border-[var(--border)] bg-[var(--background)] px-4 py-6 flex flex-col"
      >
        <Link href="/" className="flex items-center gap-2 mb-6" aria-label="Dashboard home">
          <p className="text-sm font-bold tracking-tight text-[var(--foreground)]">Admin</p>
        </Link>
        <nav aria-label="Main navigation" className="flex-1">
          <NavClient nav={NAV} />
        </nav>
        <div className="mt-auto pt-4 border-t border-[var(--border)] space-y-1">
          <ThemeToggle />
          <a
            href="/auth/sign-out"
            className="block rounded-lg px-3 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Sign out
          </a>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto px-8 py-8">
        {children}
      </main>
    </div>
  );
}
