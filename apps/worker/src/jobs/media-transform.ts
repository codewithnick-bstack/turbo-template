import { Worker, type Job } from "bullmq";
import { connection } from "../queues";

export type MediaTransformJob = {
  mediaId: string;
  storageKey: string;
  mimeType: string;
  tenantId: string;
};

export const mediaTransformWorker = new Worker<MediaTransformJob>(
  "media",
  async (job: Job<MediaTransformJob>) => {
    const { mediaId, storageKey, mimeType, tenantId } = job.data;

    // Only process images
    if (!mimeType.startsWith("image/")) return;

    // In production: download from R2, generate variants with sharp/libvips, upload back
    // Config-driven via R2_ACCOUNT_ID / R2_BUCKET env vars
    const r2Configured =
      process.env.R2_ACCOUNT_ID && process.env.R2_BUCKET && process.env.R2_ACCESS_KEY_ID;

    if (!r2Configured) {
      console.log(`[media-transform] R2 not configured, skipping transform for ${mediaId}`);
      return;
    }

    // Variant sizes to generate
    const variants = [
      { suffix: "sm", width: 400 },
      { suffix: "md", width: 800 },
      { suffix: "lg", width: 1600 },
    ];

    for (const variant of variants) {
      const variantKey = storageKey.replace(/(\.[^.]+)$/, `-${variant.suffix}$1`);
      // Would call: sharp(sourceBuffer).resize(variant.width).webp().toBuffer()
      // Then upload variantKey to R2
      console.log(`[media-transform] Would generate ${variantKey} @ ${variant.width}px for tenant ${tenantId}`);
    }
  },
  {
    connection,
    concurrency: 3,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
    },
  },
);
