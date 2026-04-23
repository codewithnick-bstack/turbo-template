import { Worker, type Job } from "bullmq";
import { createDb } from "@repo/db";
import { connection } from "../queues";
import { env } from "../env";

const { db } = createDb({ url: env.DATABASE_URL });

export type AiCompletionJob = {
  tenantId: string;
  jobType: "blog_draft" | "seo_audit" | "site_copilot" | "custom";
  model?: string;
  system?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  callbackQueue?: string;
  callbackJobId?: string;
  metadata?: Record<string, unknown>;
};

export type AiCompletionResult = {
  text: string;
  usage: { inputTokens: number; outputTokens: number };
  model: string;
  finishReason: string;
  jobType: AiCompletionJob["jobType"];
  tenantId: string;
};

export const aiCompletionWorker = new Worker<AiCompletionJob>(
  "ai",
  async (job: Job<AiCompletionJob>) => {
    const { tenantId, jobType, model, system, messages, maxTokens, metadata } = job.data;

    const provider = process.env.AI_PROVIDER ?? "mock";
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Lazy import to keep cold start fast
    const { createModelAdapter } = await import("@repo/ai");
    const adapter = createModelAdapter({
      provider: provider as "anthropic" | "openai" | "mock",
      anthropicApiKey: anthropicKey,
      openaiApiKey: openaiKey,
      defaultModel: model,
    });

    const result = await adapter.complete({
      model: model ?? (provider === "anthropic" ? "claude-opus-4-7" : "gpt-4o"),
      system,
      messages,
      maxTokens,
    });

    const output: AiCompletionResult = {
      text: result.text,
      usage: result.usage,
      model: result.model,
      finishReason: result.finishReason,
      jobType,
      tenantId,
    };

    console.log("[ai-completion] completed", {
      jobId: job.id,
      jobType,
      tenantId,
      inputTokens: result.usage.inputTokens,
      outputTokens: result.usage.outputTokens,
    });

    void db; // db available for future: persist results, record usage, etc.
    void metadata;

    return output;
  },
  {
    connection,
    concurrency: 5,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: "exponential", delay: 3000 },
    },
  },
);

aiCompletionWorker.on("failed", (job, err) => {
  console.error("[ai-completion] job failed", { jobId: job?.id, error: err.message });
});
