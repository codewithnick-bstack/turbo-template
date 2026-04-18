import Link from "next/link";

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";
const DEV_TENANT = process.env.DEV_TENANT_ID ?? "dev-tenant-id";

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
    const res = await fetch(`${API}/v1/templates`, {
      headers: { "x-tenant-id": DEV_TENANT, "x-user-id": "dev-user-id", "x-role": "owner" },
    });
    if (res.ok) ({ data: templates } = await res.json());
  } catch {
    // API unavailable
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Template Marketplace</h1>
          <p className="text-neutral-500 text-sm">Start a new site from a pre-built template.</p>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-lg font-medium mb-2">No templates available yet.</p>
          <p className="text-sm">First-party templates will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {t.thumbnailUrl ? (
                <img src={t.thumbnailUrl} alt={t.name} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-sm">{t.name}</h3>
                  <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded capitalize">{t.category}</span>
                </div>
                {t.description && <p className="text-xs text-neutral-500 mb-3">{t.description}</p>}
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
