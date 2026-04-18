#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { PlatformClient } from "@repo/sdk";

const program = new Command();
program
  .name("platform")
  .description("Agent-Native Website Platform CLI")
  .version("0.1.0");

program
  .command("login")
  .description("Authenticate via device-code flow (placeholder).")
  .action(() => {
    console.log(pc.cyan("Device flow login coming in Phase 6.2"));
  });

program
  .command("sites:list")
  .description("List sites for the authenticated tenant.")
  .option("--api <url>", "API base URL", process.env.PLATFORM_API_URL ?? "http://localhost:4100")
  .option("--key <apiKey>", "API key", process.env.PLATFORM_API_KEY)
  .action(async (opts: { api: string; key?: string }) => {
    const client = new PlatformClient({ baseUrl: opts.api, apiKey: opts.key });
    const sites = await client.sites.list();
    console.log(JSON.stringify(sites, null, 2));
  });

program
  .command("publish <pageId>")
  .description("Publish a page.")
  .option("--api <url>", "API base URL", process.env.PLATFORM_API_URL ?? "http://localhost:4100")
  .option("--key <apiKey>", "API key", process.env.PLATFORM_API_KEY)
  .action(async (pageId: string, opts: { api: string; key?: string }) => {
    const client = new PlatformClient({ baseUrl: opts.api, apiKey: opts.key });
    const result = await client.pages.publish(pageId);
    console.log(pc.green("published:"), result);
  });

program.parseAsync(process.argv);
