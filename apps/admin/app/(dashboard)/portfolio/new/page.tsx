import type { Metadata } from "next";
import { PortfolioEntryForm } from "../portfolio-form";

export const metadata: Metadata = { title: "New Portfolio Entry" };

export default function NewPortfolioEntryPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Add portfolio entry</h1>
      <PortfolioEntryForm />
    </div>
  );
}
