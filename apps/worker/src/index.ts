import { queues } from "./queues";
import { env } from "./env";
import { revalidateWorker } from "./jobs/revalidate";
import { indexnowWorker } from "./jobs/indexnow";
import { webhookWorker } from "./jobs/webhook-deliver";
import { searchIndexWorker } from "./jobs/search-index";
import { mediaTransformWorker } from "./jobs/media-transform";
import { emailSendWorker } from "./jobs/email-send";
import { aiCompletionWorker } from "./jobs/ai-completion";

async function boot() {
  console.log("worker booted", { env: env.NODE_ENV });

  await queues.indexnow.add(
    "indexnow-schedule",
    {},
    {
      repeat: { pattern: "*/30 * * * *" },
      jobId: "indexnow-schedule",
    },
  );

  const shutdown = async () => {
    console.log("worker shutting down");
    await Promise.all([
      revalidateWorker.close(),
      indexnowWorker.close(),
      webhookWorker.close(),
      searchIndexWorker.close(),
      mediaTransformWorker.close(),
      emailSendWorker.close(),
      aiCompletionWorker.close(),
    ]);
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

boot().catch((err) => {
  console.error(err);
  process.exit(1);
});
