import { BrandingClient } from "./branding-client";

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";
const DEV_TENANT = process.env.DEV_TENANT_ID ?? "dev-tenant-id";

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
    const res = await fetch(`${API}/v1/branding`, {
      headers: { "x-tenant-id": DEV_TENANT, "x-user-id": "dev-user-id", "x-role": "owner" },
    });
    if (res.ok) branding = await res.json();
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
