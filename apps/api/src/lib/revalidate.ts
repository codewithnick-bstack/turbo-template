import { env } from "../env";
import { logger } from "./logger";

export function revalidatePaths(paths: string[]): void {
  if (!env.REVALIDATE_SECRET || !env.WEB_URL) return;

  const url = `${env.WEB_URL}/api/revalidate`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.REVALIDATE_SECRET}`,
  };

  for (const path of paths) {
    fetch(url, { method: "POST", headers, body: JSON.stringify({ path }) }).catch((err) => {
      logger.warn({ err, path }, "ISR revalidation failed");
    });
  }
}
