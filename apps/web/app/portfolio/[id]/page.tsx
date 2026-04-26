import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getPortfolioEntry } from "@/lib/api";
import { siteConfig } from "@/lib/site-data";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = await getPortfolioEntry(id).catch(() => null);
  if (!entry) return { title: "Not found" };

  const title = entry.client ? `${entry.title} — ${entry.client}` : entry.title;
  const description = entry.description ?? `Case study: ${entry.title}`;

  return {
    title,
    description,
    alternates: { canonical: `/portfolio/${id}` },
    openGraph: {
      title,
      description,
      url: `/portfolio/${id}`,
      type: "article",
      ...(entry.coverImageUrl ? { images: [{ url: entry.coverImageUrl, width: 1200, height: 630, alt: entry.title }] } : {}),
    },
    twitter: {
      card: entry.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(entry.coverImageUrl ? { images: [entry.coverImageUrl] } : {}),
    },
  };
}

export default async function PortfolioEntryPage({ params }: Props) {
  const { id } = await params;
  const entry = await getPortfolioEntry(id).catch(() => null);
  if (!entry || entry.status !== "published") notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: entry.title,
    description: entry.description ?? undefined,
    url: entry.url ?? undefined,
    author: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    ...(entry.client ? { client: entry.client } : {}),
    ...(entry.tags?.length ? { keywords: entry.tags.join(", ") } : {}),
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link
        href="/portfolio"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-8 group"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
        All work
      </Link>

      <header className="mb-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{entry.title}</h1>
          {entry.url && (
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 shrink-0"
            >
              View live <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}
        </div>
        {entry.client && (
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Client: {entry.client}</p>
        )}
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Tags">
            {entry.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}
      </header>

      {entry.coverImageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl mb-10 bg-slate-100 dark:bg-slate-800">
          <Image
            src={entry.coverImageUrl}
            alt={entry.title}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
      )}

      {entry.description && (
        <section aria-labelledby="description-heading" className="mb-10">
          <h2 id="description-heading" className="sr-only">Description</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{entry.description}</p>
        </section>
      )}

      {entry.images?.length > 0 && (
        <section aria-labelledby="gallery-heading" className="mb-10">
          <h2 id="gallery-heading" className="text-xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {entry.images.map((src, i) => (
              <div key={i} className="relative aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <Image
                  src={src}
                  alt={`${entry.title} — image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 448px"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="pt-10 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          Back to all work
        </Link>
      </footer>
    </main>
  );
}
