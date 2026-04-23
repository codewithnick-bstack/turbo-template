#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import { PlatformClient } from "@repo/sdk";

const program = new Command();
program
  .name("platform")
  .description("Agent-Native Website Platform CLI")
  .version("0.1.0");

function makeClient(opts: { api: string; key?: string }) {
  return new PlatformClient({ baseUrl: opts.api, apiKey: opts.key });
}

function apiOpts(cmd: Command) {
  return cmd
    .option("--api <url>", "API base URL", process.env.PLATFORM_API_URL ?? "http://localhost:4100")
    .option("--key <apiKey>", "API key", process.env.PLATFORM_API_KEY);
}

// ── auth ───────────────────────────────────────────────────────────────────
program
  .command("login")
  .description("Authenticate via device-code flow.")
  .action(() => {
    console.log(pc.cyan("Device flow login — configure PLATFORM_API_KEY in env for now."));
  });

// ── sites ──────────────────────────────────────────────────────────────────
const sites = program.command("sites").description("Manage sites.");
apiOpts(sites.command("list").description("List sites.").action(async (opts) => {
  const result = await makeClient(opts).sites.list();
  console.log(JSON.stringify(result, null, 2));
}));
apiOpts(sites.command("get <id>").description("Get a site.").action(async (id: string, opts) => {
  const result = await makeClient(opts).sites.get(id);
  console.log(JSON.stringify(result, null, 2));
}));
apiOpts(
  sites
    .command("create")
    .description("Create a new site.")
    .requiredOption("--name <name>", "Site name")
    .requiredOption("--slug <slug>", "URL slug")
    .action(async (opts) => {
      const client = makeClient(opts);
      const result = await client.sites.create({ name: opts.name, slug: opts.slug });
      console.log(pc.green("created:"), JSON.stringify(result, null, 2));
    }),
);

// ── pages ──────────────────────────────────────────────────────────────────
const pages = program.command("pages").description("Manage pages.");
apiOpts(
  pages
    .command("list <siteId>")
    .description("List pages for a site.")
    .action(async (siteId: string, opts) => {
      const result = await makeClient(opts).pages.list(siteId);
      console.log(JSON.stringify(result, null, 2));
    }),
);
apiOpts(
  pages
    .command("publish <pageId>")
    .description("Publish a page.")
    .action(async (pageId: string, opts) => {
      const result = await makeClient(opts).pages.publish(pageId);
      console.log(pc.green("published:"), JSON.stringify(result, null, 2));
    }),
);

// ── blog ───────────────────────────────────────────────────────────────────
const blog = program.command("blog").description("Manage blog posts.");
apiOpts(
  blog
    .command("list <siteId>")
    .description("List blog posts.")
    .action(async (siteId: string, opts) => {
      const result = await makeClient(opts).blog.listPosts(siteId);
      console.log(JSON.stringify(result, null, 2));
    }),
);
apiOpts(
  blog
    .command("publish <postId>")
    .description("Publish a blog post.")
    .action(async (postId: string, opts) => {
      const result = await makeClient(opts).blog.publishPost(postId);
      console.log(pc.green("published:"), JSON.stringify(result, null, 2));
    }),
);

// ── analytics ──────────────────────────────────────────────────────────────
const analytics = program.command("analytics").description("Site analytics.");
apiOpts(
  analytics
    .command("get <siteId>")
    .description("Get analytics for a site.")
    .option("--days <n>", "Number of days", "30")
    .action(async (siteId: string, opts) => {
      const result = await makeClient(opts).analytics.get(siteId, Number(opts.days));
      console.log(JSON.stringify(result, null, 2));
    }),
);

// ── search ─────────────────────────────────────────────────────────────────
apiOpts(
  program
    .command("search <query>")
    .description("Search across site content.")
    .option("--limit <n>", "Max results", "10")
    .action(async (query: string, opts) => {
      const res = await fetch(
        `${opts.api}/v1/search?q=${encodeURIComponent(query)}&limit=${opts.limit}`,
        opts.key ? { headers: { authorization: `Bearer ${opts.key}` } } : {},
      );
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
    }),
);

// ── templates ──────────────────────────────────────────────────────────────
const templates = program.command("templates").description("Template marketplace.");
apiOpts(
  templates
    .command("list")
    .description("List available templates.")
    .action(async (opts) => {
      const res = await fetch(`${opts.api}/v1/templates`);
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
    }),
);
apiOpts(
  templates
    .command("use <templateId>")
    .description("Create a site from a template.")
    .requiredOption("--name <name>", "New site name")
    .requiredOption("--slug <slug>", "New site slug")
    .action(async (templateId: string, opts) => {
      const res = await fetch(`${opts.api}/v1/templates/${templateId}/use`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(opts.key ? { authorization: `Bearer ${opts.key}` } : {}),
        },
        body: JSON.stringify({ name: opts.name, slug: opts.slug }),
      });
      const data = await res.json();
      console.log(pc.green("site created:"), JSON.stringify(data, null, 2));
    }),
);

// ── members ────────────────────────────────────────────────────────────────
const members = program.command("members").description("Team member management.");
apiOpts(
  members
    .command("list")
    .description("List team members.")
    .action(async (opts) => {
      const res = await fetch(`${opts.api}/v1/members`, {
        headers: opts.key ? { authorization: `Bearer ${opts.key}` } : {},
      });
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
    }),
);
apiOpts(
  members
    .command("invite <email>")
    .description("Invite a team member.")
    .option("--role <role>", "Role (admin|editor|viewer)", "editor")
    .action(async (email: string, opts) => {
      const res = await fetch(`${opts.api}/v1/members/invite`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(opts.key ? { authorization: `Bearer ${opts.key}` } : {}),
        },
        body: JSON.stringify({ email, role: opts.role }),
      });
      const data = await res.json();
      console.log(pc.green("invited:"), JSON.stringify(data, null, 2));
    }),
);

// ── agency ─────────────────────────────────────────────────────────────────
const agency = program.command("agency").description("Agency workspace management.");
apiOpts(
  agency
    .command("list-clients")
    .description("List client workspaces under the agency.")
    .action(async (opts) => {
      const result = await makeClient(opts).agency.listClients();
      console.log(JSON.stringify(result, null, 2));
    }),
);
apiOpts(
  agency
    .command("create-client")
    .description("Create a client workspace.")
    .requiredOption("--name <name>", "Client name")
    .requiredOption("--slug <slug>", "Client slug")
    .action(async (opts) => {
      const result = await makeClient(opts).agency.createClient({ name: opts.name, slug: opts.slug });
      console.log(pc.green("created:"), JSON.stringify(result, null, 2));
    }),
);
apiOpts(
  agency
    .command("remove-client <clientId>")
    .description("Remove a client workspace.")
    .action(async (clientId: string, opts) => {
      const result = await makeClient(opts).agency.removeClient(clientId);
      console.log(pc.yellow("removed:"), JSON.stringify(result, null, 2));
    }),
);

// ── audit ──────────────────────────────────────────────────────────────────
const audit = program.command("audit").description("Audit log operations.");
apiOpts(
  audit
    .command("list")
    .description("List audit log entries.")
    .option("--limit <n>", "Max results", "20")
    .option("--resource <kind>", "Filter by resource kind")
    .action(async (opts) => {
      const result = await makeClient(opts).audit.list({
        limit: Number(opts.limit),
        resourceKind: opts.resource,
      });
      console.log(JSON.stringify(result, null, 2));
    }),
);

// ── search ─────────────────────────────────────────────────────────────────
const search = program.command("search").description("Search across content.");
apiOpts(
  search
    .command("query <q>")
    .description("Full-text + semantic search.")
    .option("--limit <n>", "Max results", "10")
    .action(async (q: string, opts) => {
      const result = await makeClient(opts).search.query(q, Number(opts.limit));
      console.log(JSON.stringify(result, null, 2));
    }),
);

program.parseAsync(process.argv);
