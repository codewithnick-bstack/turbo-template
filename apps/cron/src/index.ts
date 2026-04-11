import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import cron from "node-cron";

import { env } from "./env";

const stateFile = path.join(process.cwd(), ".indexnow-state.json");
const logDir = path.join(process.cwd(), "logs");
const logFile = path.join(logDir, "indexnow.log");

async function appendLog(message: string) {
  const line = `[${new Date().toISOString()}] ${message}`;
  console.log(line);
  await mkdir(logDir, { recursive: true });
  await writeFile(logFile, `${line}\n`, { flag: "a" });
}

async function loadPreviousHash() {
  try {
    const raw = await readFile(stateFile, "utf8");
    return JSON.parse(raw).hash as string | undefined;
  } catch {
    return undefined;
  }
}

async function saveHash(hash: string) {
  await writeFile(stateFile, JSON.stringify({ hash, updatedAt: new Date().toISOString() }, null, 2));
}

async function fetchSitemap() {
  const response = await fetch(env.SITEMAP_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }

  const xml = await response.text();
  const urls = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g))
    .map((match) => match[1])
    .filter((value): value is string => Boolean(value));
  return { xml, urls };
}

async function postIndexNow(urls: string[]) {
  const payload = {
    host: env.INDEXNOW_HOST,
    key: env.INDEXNOW_KEY,
    keyLocation: env.INDEXNOW_KEY_LOCATION,
    urlList: urls,
  };

  if (!env.INDEXNOW_KEY) {
    await appendLog(`Dry run: no INDEXNOW_KEY configured. Would submit ${urls.length} URL(s).`);
    return;
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(env.INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`IndexNow failed with status ${response.status}`);
      }

      await appendLog(`IndexNow submitted successfully on attempt ${attempt}.`);
      return;
    } catch (error) {
      lastError = error;
      await appendLog(`IndexNow attempt ${attempt} failed.`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  throw lastError;
}

export async function submitIndexNow() {
  const { xml, urls } = await fetchSitemap();
  const hash = createHash("sha256").update(xml).digest("hex");
  const previousHash = await loadPreviousHash();

  if (previousHash === hash) {
    await appendLog("No sitemap changes detected. Skipping IndexNow submission.");
    return;
  }

  await postIndexNow(urls.slice(0, 1000));
  await saveHash(hash);
  await appendLog(`Stored new sitemap hash with ${urls.length} URL(s).`);
}

async function boot() {
  await appendLog(`Cron service started with schedule ${env.CRON_SCHEDULE}.`);
  await submitIndexNow().catch(async (error) => {
    await appendLog(`Initial IndexNow sync failed: ${String(error)}`);
  });

  cron.schedule(env.CRON_SCHEDULE, () => {
    void submitIndexNow().catch(async (error) => {
      await appendLog(`Scheduled IndexNow sync failed: ${String(error)}`);
    });
  });
}

void boot();
