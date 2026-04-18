import { UseTemplateClient } from "./use-template-client";

type Props = { params: Promise<{ id: string }> };

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";
const DEV_TENANT = process.env.DEV_TENANT_ID ?? "dev-tenant-id";

type Template = { id: string; name: string; description?: string };

export default async function UseTemplatePage({ params }: Props) {
  const { id } = await params;
  let template: Template | null = null;
  try {
    const res = await fetch(`${API}/v1/templates/${id}`, {
      headers: { "x-tenant-id": DEV_TENANT, "x-user-id": "dev-user-id", "x-role": "owner" },
    });
    if (res.ok) template = await res.json();
  } catch {
    // API unavailable
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">Use Template</h1>
      {template && <p className="text-neutral-500 text-sm mb-6">{template.name}</p>}
      <UseTemplateClient templateId={id} />
    </div>
  );
}
