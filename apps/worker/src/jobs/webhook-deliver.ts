import { Worker } from "bullmq";
import { createHmac } from "node:crypto";
import { connection } from "../queues";

type WebhookJob = {
  url: string;
  secret: string;
  event: string;
  payload: Record<string, unknown>;
  subscriptionId: string;
};

export const webhookWorker = new Worker<WebhookJob>(
  "webhook",
  async (job) => {
    const body = JSON.stringify({
      event: job.data.event,
      payload: job.data.payload,
      subscriptionId: job.data.subscriptionId,
      deliveredAt: new Date().toISOString(),
    });
    const signature = createHmac("sha256", job.data.secret).update(body).digest("hex");

    const res = await fetch(job.data.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-platform-event": job.data.event,
        "x-platform-signature": `sha256=${signature}`,
      },
      body,
    });

    if (!res.ok) throw new Error(`webhook ${res.status}`);
    return { status: res.status };
  },
  {
    connection,
    concurrency: 10,
    limiter: { max: 50, duration: 1000 },
  },
);
