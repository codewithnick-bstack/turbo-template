import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { teamMembers, values } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "About",
  description: "Meet the team and values behind this client website starter.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Badge>About</Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">A flexible starter for fast-moving agencies and freelancers</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
        This template was designed to make client site launches repeatable: strong information architecture, thoughtful defaults, and enough polish to feel custom from day one.
      </p>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <h2 className="text-2xl font-semibold">Our story</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Built from real agency workflows, the starter combines a premium marketing front-end with a lightweight backend and automation layer. The result is a clean baseline for launches, retainers, and growth experiments.
          </p>
        </Card>
        <Card>
          <h2 className="text-2xl font-semibold">What makes it different</h2>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <li>• Beautiful defaults tuned for mobile-first layouts</li>
            <li>• SEO, accessibility, and performance baked in</li>
            <li>• Clear structure for Vercel, Railway, or Docker deployment</li>
          </ul>
        </Card>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Core values</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title}>
              <h3 className="font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{value.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Meet the team</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.name}>
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-semibold text-white">
                {member.name.charAt(0)}
              </div>
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-indigo-600 dark:text-indigo-300">{member.role}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{member.bio}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
