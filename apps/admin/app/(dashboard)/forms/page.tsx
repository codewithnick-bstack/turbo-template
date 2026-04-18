import Link from "next/link";
import { getApiClient } from "../../../lib/api";

type Form = { id: string; name: string; siteId: string; captcha: boolean; createdAt: string };

export default async function FormsPage() {
  const api = getApiClient();
  const forms: Form[] = [];
  let error: string | null = null;

  try {
    const siteIdParam = ""; // No site filter — can't list all forms without siteId
    if (!siteIdParam) {
      error = "Select a site to view its forms.";
    }
  } catch {
    error = "Unable to load forms.";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Forms</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Navigate to a site to view and manage its forms.
      </p>
      {error && <p className="mt-4 text-sm text-[var(--muted-foreground)]">{error}</p>}
      <Link href="/sites" className="mt-4 inline-block text-sm text-blue-500 hover:underline">
        View sites →
      </Link>
    </div>
  );
}
