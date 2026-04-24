import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverFetch } from "@/lib/api";
import type { PortfolioEntry } from "@/lib/types";
import { PortfolioEntryForm } from "../portfolio-form";

export const metadata: Metadata = { title: "Edit Portfolio Entry" };

export default async function EditPortfolioEntryPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = await params;

  let entry: PortfolioEntry;
  try {
    entry = await serverFetch<PortfolioEntry>(`/portfolio/${entryId}`);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Edit portfolio entry</h1>
      <PortfolioEntryForm entry={entry} />
    </div>
  );
}
