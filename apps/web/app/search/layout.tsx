import type { Metadata } from "next";

// The search page itself is a client component, so it cannot export metadata.
// This layout carries it instead. Results pages are deliberately noindex:
// they are thin, query-dependent, and would compete with the real pages for
// the same terms.
export const metadata: Metadata = {
  title: "Search",
  description:
    "Search open construction and infrastructure roles, insights, and closed searches across S.R. Clarke.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
