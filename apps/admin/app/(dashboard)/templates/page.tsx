import Link from "next/link";
import Image from "next/image";
import { getApiClient } from "../../../lib/api";

type Template = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
};

export default async function TemplatesPage() {
  let templates: Template[] = [];
  try {
    const api = getApiClient();
    const res = await api.templates.list() as { data: Template[] };
    templates = res.data ?? [];
  } catch {
    // API unavailable
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Template Marketplace</h1>
          <p className="text-[var(--muted-foreground)] text-sm">Start a new site from a pre-built template.</p>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-lg font-medium mb-2">No templates available yet.</p>
          <p className="text-sm">First-party templates will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {t.thumbnailUrl ? (
                <Image src={t.thumbnailUrl} alt={t.name} width={400} height={160} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-sm">{t.name}</h3>
                  <span className="text-xs bg-[var(--muted)] text-neutral-600 px-2 py-0.5 rounded capitalize">{t.category}</span>
                </div>
                {t.description && <p className="text-xs text-[var(--muted-foreground)] mb-3">{t.description}</p>}
                <Link
                  href={`/templates/${t.id}/use`}
                  className="block text-center text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium"
                >
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
