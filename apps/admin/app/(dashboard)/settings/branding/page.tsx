import { BrandingClient } from "./branding-client";
import { getApiClient } from "../../../../lib/api";

type Branding = {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  customCss?: string;
  supportEmail?: string;
};

export default async function BrandingPage() {
  let branding: Branding = {};
  try {
    const api = getApiClient();
    branding = await api.branding.get() as Branding;
  } catch {
    // API unavailable
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">White-Label Branding</h1>
      <p className="text-neutral-500 text-sm mb-6">Customize your platform appearance.</p>
      <BrandingClient initial={branding} />
    </div>
  );
}
