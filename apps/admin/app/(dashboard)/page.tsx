import Link from "next/link";

const SECTIONS = [
  { href: "/blog", label: "Blog", description: "Write and publish posts" },
  { href: "/contacts", label: "Contacts", description: "View inquiries from visitors" },
  { href: "/team", label: "Team", description: "Manage team members" },
  { href: "/testimonials", label: "Testimonials", description: "Manage client quotes" },
  { href: "/portfolio", label: "Portfolio", description: "Showcase your work" },
  { href: "/settings", label: "Settings", description: "Site name, SEO, contact info" },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
      <p className="mb-8 text-sm text-[var(--muted-foreground)]">Manage your website content.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-xl border border-[var(--border)] px-5 py-5 hover:bg-[var(--muted)] transition-colors"
          >
            <p className="font-semibold">{section.label}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
