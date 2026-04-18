import { AssistantClient } from "./assistant-client";

type Props = { params: Promise<{ id: string }> };

export default async function AssistantPage({ params }: Props) {
  const { id } = await params;
  return <AssistantClient siteId={id} />;
}
