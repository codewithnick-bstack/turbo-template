import type { Metadata } from "next";
import { AiAssistant } from "./ai-assistant";

export const metadata: Metadata = { title: "AI Assistant" };

export default function AiPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-bold">AI Assistant</h1>
      <p className="mb-6 text-sm text-[var(--muted-foreground)]">Generate blog drafts and SEO descriptions.</p>
      <AiAssistant />
    </div>
  );
}
