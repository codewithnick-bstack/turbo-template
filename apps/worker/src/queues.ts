import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import { env } from "./env";

export const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

export const queues = {
  revalidate: new Queue("revalidate", { connection }),
  media: new Queue("media", { connection }),
  webhook: new Queue("webhook", { connection }),
  email: new Queue("email", { connection }),
  indexnow: new Queue("indexnow", { connection }),
  ai: new Queue("ai", { connection }),
  search: new Queue("search", { connection }),
};

export const queueEvents = {
  revalidate: new QueueEvents("revalidate", { connection }),
  media: new QueueEvents("media", { connection }),
  webhook: new QueueEvents("webhook", { connection }),
  email: new QueueEvents("email", { connection }),
  indexnow: new QueueEvents("indexnow", { connection }),
  ai: new QueueEvents("ai", { connection }),
};
