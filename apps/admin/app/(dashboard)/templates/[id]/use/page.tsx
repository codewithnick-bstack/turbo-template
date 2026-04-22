import { UseTemplateClient } from "./use-template-client";
import { getApiClient } from "../../../../../lib/api";
import type { TTemplate } from "@repo/sdk";

type Props = { params: Promise<{ id: string }> };

export default async function UseTemplatePage({ params }: Props) {
  const { id } = await params;
  let template: TTemplate | null = null;
  try {
    const api = getApiClient();
    template = await api.templates.get(id);
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
