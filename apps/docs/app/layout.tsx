import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { template: "%s — Platform Docs", default: "Platform Docs" },
  description: "API, MCP, and SDK reference for the Agent-Native Website Platform.",
};

const NAV: Array<{ heading: string; items: { href: string; label: string }[] }> = [
  { heading: "Introduction", items: [
    { href: "/", label: "Overview" },
    { href: "/getting-started", label: "Getting Started" },
  ]},
  { heading: "Core API", items: [
    { href: "/api-reference", label: "API Reference" },
    { href: "/webhooks", label: "Webhooks" },
    { href: "/sdk", label: "SDK" },
    { href: "/cli", label: "CLI" },
  ]},
  { heading: "Agent Layer", items: [
    { href: "/mcp-guide", label: "MCP / Agents" },
    { href: "/sandboxes", label: "Sandboxes" },
  ]},
  { heading: "Platform", items: [
    { href: "/agency", label: "Agency & Clients" },
    { href: "/compliance", label: "Compliance" },
  ]},
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100dvh", margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <a
          href="#main-content"
          style={{ position: "fixed", top: -50, left: 8, zIndex: 100, padding: "8px 16px", borderRadius: 4, background: "var(--primary)", color: "#fff", fontSize: 14, textDecoration: "none" }}
          onFocus={(e) => (e.currentTarget.style.top = "8px")}
          onBlur={(e) => (e.currentTarget.style.top = "-50px")}
        >
          Skip to content
        </a>
        <aside
          aria-label="Documentation navigation"
          style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", padding: "24px 16px", background: "var(--sidebar-bg)", display: "flex", flexDirection: "column" }}
        >
          <Link href="/" style={{ fontWeight: 700, fontSize: 14, textDecoration: "none", color: "var(--fg)", display: "block", marginBottom: 24 }}>
            Platform Docs
          </Link>
          <nav aria-label="Main navigation" style={{ flex: 1 }}>
            {NAV.map((group) => (
              <div key={group.heading} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", marginBottom: 6 }}>
                  {group.heading}
                </p>
                <ul role="list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} style={{ display: "block", padding: "5px 8px", fontSize: 13, color: "var(--fg)", textDecoration: "none", borderRadius: 4 }}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div style={{ paddingTop: 12, fontSize: 12, color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}>GitHub</a>
          </div>
        </aside>
        <main id="main-content" tabIndex={-1} style={{ flex: 1, padding: "40px 48px", maxWidth: 800 }}>{children}</main>
      </body>
    </html>
  );
}
