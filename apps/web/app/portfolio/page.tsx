import type { Metadata } from "next";

import { PortfolioShowcase } from "@/components/portfolio-showcase";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Browse example client projects and case-study placeholders.",
};

export default function PortfolioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Badge>Portfolio</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Case-study style projects with filters and lightbox previews</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        Use this section for client proof, featured launches, before-and-after stories, or selected work grouped by niche.
      </p>
      <div className="mt-8">
        <PortfolioShowcase />
      </div>
    </div>
  );
}
