import type { Metadata } from "next";

import { ServicesShowcase } from "@/components/services-showcase";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore the service packages included in the starter demo site.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Badge>Services</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Service packages that turn visits into conversations</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        Each card can be repurposed for design, consulting, legal, wellness, real estate, or portfolio websites. Use the demo copy as a starting point and adapt it per client.
      </p>
      <div className="mt-8">
        <ServicesShowcase />
      </div>
    </div>
  );
}
