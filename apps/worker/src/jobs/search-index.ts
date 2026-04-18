import { Worker } from "bullmq";
import { connection } from "../queues";
import { createDb } from "@repo/db";
import { createPostgresSearchIndex } from "@repo/search";
import { env } from "../env";

const { db } = createDb({ url: env.DATABASE_URL });
const searchIndex = createPostgresSearchIndex(db);

export type SearchIndexJobData = {
  id: string;
  tenantId: string;
  siteId: string;
  kind: "page" | "post" | "entry" | "media";
  title: string;
  body: string;
  url: string;
  action: "upsert" | "delete";
};

export const searchIndexWorker = new Worker<SearchIndexJobData>(
  "search",
  async (job) => {
    const data = job.data;
    if (data.action === "delete") {
      await searchIndex.delete([data.id]);
    } else {
      await searchIndex.upsert([{
        id: data.id,
        tenantId: data.tenantId,
        siteId: data.siteId,
        kind: data.kind,
        title: data.title,
        body: data.body,
        url: data.url,
      }]);
    }
  },
  { connection, concurrency: 5 },
);

searchIndexWorker.on("failed", (job, err) => {
  console.error("[search-index] job failed", { jobId: job?.id, error: err.message });
});
