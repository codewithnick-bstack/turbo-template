#!/usr/bin/env tsx
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const CORE_DIR = join(ROOT, "packages/core/src");

type Contract = {
  operation: string;
  description?: string;
  method?: string;
  path?: string;
  idempotent?: boolean;
};

async function walk(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, files);
    else if (entry.name.endsWith(".ts")) files.push(full);
  }
  return files;
}

async function extractContracts(): Promise<Contract[]> {
  const files = await walk(CORE_DIR);
  const contracts: Contract[] = [];

  for (const file of files) {
    const src = await readFile(file, "utf8");
    const regex = /defineContract\(\{([\s\S]*?)\}\)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(src))) {
      const block = match[1] ?? "";
      const opMatch = /operation:\s*["']([^"']+)["']/.exec(block);
      const descMatch = /description:\s*["']([^"']+)["']/.exec(block);
      const methodMatch = /http:\s*\{[^}]*method:\s*["']([^"']+)["']/.exec(block);
      const pathMatch = /http:\s*\{[^}]*path:\s*["']([^"']+)["']/.exec(block);
      const idempotent = /idempotent:\s*true/.test(block);
      if (!opMatch) continue;
      contracts.push({
        operation: opMatch[1]!,
        description: descMatch?.[1],
        method: methodMatch?.[1]?.toLowerCase(),
        path: pathMatch?.[1],
        idempotent,
      });
    }
  }

  return contracts;
}

function toOpenApiPath(contracts: Contract[]) {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const c of contracts) {
    if (!c.method || !c.path) continue;
    if (!paths[c.path]) paths[c.path] = {};

    const operationId = c.operation.replace(/\./g, "_");
    const pathParams: string[] = [];
    const paramRegex = /:([a-zA-Z]+)/g;
    let pm: RegExpExecArray | null;
    let openApiPath = c.path;
    while ((pm = paramRegex.exec(c.path))) {
      pathParams.push(pm[1]!);
      openApiPath = openApiPath.replace(`:${pm[1]}`, `{${pm[1]}}`);
    }

    if (openApiPath !== c.path && !paths[openApiPath]) {
      paths[openApiPath] = {};
    }
    const target = openApiPath !== c.path ? openApiPath : c.path;
    if (!paths[target]) paths[target] = {};

    paths[target]![c.method] = {
      operationId,
      summary: c.description ?? c.operation,
      tags: [c.operation.split(".")[0]],
      parameters: [
        ...pathParams.map((name) => ({
          name,
          in: "path",
          required: true,
          schema: { type: "string" },
        })),
      ],
      ...(["post", "put", "patch"].includes(c.method)
        ? { requestBody: { content: { "application/json": { schema: { type: "object" } } } } }
        : {}),
      responses: {
        "200": { description: "Success", content: { "application/json": { schema: { type: "object" } } } },
        "400": { description: "Bad request" },
        "401": { description: "Unauthorized" },
        "404": { description: "Not found" },
        "500": { description: "Internal server error" },
      },
      security: [{ bearerAuth: [] }],
    };
  }

  return paths;
}

async function main() {
  const contracts = await extractContracts();
  console.log(`extracted ${contracts.length} contracts`);

  const spec = {
    openapi: "3.1.0",
    info: {
      title: "Agent-Native Website Platform API",
      version: "0.1.0",
      description: "Full-coverage API with HTTP + MCP parity for every operation.",
    },
    servers: [{ url: "http://localhost:4100", description: "Local dev" }],
    paths: toOpenApiPath(contracts),
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer" },
      },
      schemas: {},
    },
  };

  const dir = join(ROOT, "packages/sdk/generated");
  await mkdir(dir, { recursive: true });
  const outFile = join(dir, "openapi.json");
  await writeFile(outFile, JSON.stringify(spec, null, 2));
  console.log(`wrote ${relative(ROOT, outFile)} (${Object.keys(spec.paths).length} paths)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
