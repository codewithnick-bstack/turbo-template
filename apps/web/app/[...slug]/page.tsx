import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { RenderBlocks } from "@repo/renderer-blocks";
import type { TBlockTree } from "@repo/schemas";
import { getSiteByHostname, getPageBySlug } from "../../lib/platform";
import { AnalyticsBeacon } from "../../components/analytics-beacon";
import { ChatbotWidget } from "../../components/chatbot-widget";

type Props = { params: Promise<{ slug: string[] }> };

export const dynamic = "force-dynamic";

export default async function PlatformPage({ params }: Props) {
  const hdrs = await headers();
  const hostname = hdrs.get("host")?.split(":")[0] ?? "localhost";
  const { slug: slugParts } = await params;
  const slug = slugParts.join("/");

  const site = await getSiteByHostname(hostname);
  if (!site) notFound();

  const page = await getPageBySlug(site.id, slug);
  if (!page || page.status !== "published") notFound();

  const tree = page.content as TBlockTree;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100";

  return (
    <article>
      <AnalyticsBeacon
        siteId={site.id}
        tenantId={site.tenantId}
        path={"/" + slug}
        apiUrl={apiUrl}
      />
      <RenderBlocks tree={tree} />
      {process.env.NEXT_PUBLIC_CHATBOT_ENABLED === "true" && (
        <ChatbotWidget
          siteId={site.id}
          tenantId={site.tenantId}
          apiUrl={apiUrl}
        />
      )}
    </article>
  );
}

export async function generateMetadata({ params }: Props) {
  const hdrs = await headers();
  const hostname = hdrs.get("host")?.split(":")[0] ?? "localhost";
  const { slug: slugParts } = await params;
  const slug = slugParts.join("/");

  const site = await getSiteByHostname(hostname);
  if (!site) return {};

  const page = await getPageBySlug(site.id, slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
  };
}
