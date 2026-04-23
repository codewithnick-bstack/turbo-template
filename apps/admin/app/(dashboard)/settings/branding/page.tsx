import { BrandingClient } from "./branding-client";
import { getApiClient } from "../../../../lib/api";
import type { TBranding } from "@repo/sdk";

export default async function BrandingPage() {
  let branding: TBranding = {};
  try {
    const api = getApiClient();
    branding = await api.branding.get();
  } catch {
    // API unavailable
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">White-Label Branding</h1>
      <p className="text-[var(--muted-foreground)] text-sm mb-6">Customize your platform appearance.</p>
      <BrandingClient initial={branding} />
    </div>
  );
}
