import { Worker } from "bullmq";
import { createHash } from "node:crypto";
import { connection } from "../queues";
import { env } from "../env";

async function fetchSitemapUrls(): Promise<{ xml: string; urls: string[] }> {
  const response = await fetch(env.SITEMAP_URL);
  if (!response.ok) throw new Error(`sitemap fetch ${response.status}`);
  const xml = await response.text();
  const urls = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g))
    .map((m) => m[1])
    .filter((value): value is string => Boolean(value));
  return { xml, urls };
}

export const indexnowWorker = new Worker(
  "indexnow",
  async () => {
    const { xml, urls } = await fetchSitemapUrls();
    const hash = createHash("sha256").update(xml).digest("hex");

    if (!env.INDEXNOW_KEY) {
      return { mode: "dry-run", urlCount: urls.length, hash };
    }

    const response = await fetch(env.INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: env.INDEXNOW_HOST,
        key: env.INDEXNOW_KEY,
        keyLocation: env.INDEXNOW_KEY_LOCATION,
        urlList: urls.slice(0, 1000),
      }),
    });

    if (!response.ok) throw new Error(`indexnow ${response.status}`);
    return { mode: "submitted", urlCount: urls.length, hash };
  },
  { connection, concurrency: 1 },
);
