import { env } from "../env";

export function revalidatePaths(paths: string[]): void {
  if (!env.REVALIDATE_SECRET || !env.WEB_URL) return;

  const url = `${env.WEB_URL}/api/revalidate`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.REVALIDATE_SECRET}`,
  };

  for (const path of paths) {
    fetch(url, { method: "POST", headers, body: JSON.stringify({ path }) }).catch(() => {});
  }
}
