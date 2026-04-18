import { Worker } from "bullmq";
import { connection } from "../queues";
import { env } from "../env";

export const revalidateWorker = new Worker(
  "revalidate",
  async (job) => {
    const { paths, tag } = job.data as { paths?: string[]; tag?: string };
    const targets = paths ?? (tag ? [`/tag/${tag}`] : []);
    const results = await Promise.all(
      targets.map(async (path) => {
        const res = await fetch(`${env.RENDERER_BASE_URL}/api/revalidate`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ path, secret: env.REVALIDATE_SECRET }),
        });
        return { path, ok: res.ok, status: res.status };
      }),
    );
    return results;
  },
  { connection, concurrency: 5 },
);
