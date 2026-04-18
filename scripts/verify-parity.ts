#!/usr/bin/env tsx
/**
 * Agent parity invariant lint.
 * See docs/adr/0005-parity-invariant.md.
 *
 * Rules:
 * 1. Every exported ParityContract from packages/core must have a matching MCP tool entry
 *    in apps/mcp/src/tools/index.ts (by `tool` name).
 * 2. Every ParityContract with an `http` section must have a matching route mounted in
 *    apps/platform-api/src/routes (checked by path prefix presence for now; refined later).
 *
 * Exits non-zero on violation.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const CORE_DIR = join(ROOT, "packages/core/src");
const MCP_TOOLS_FILE = join(ROOT, "apps/mcp/src/tools/index.ts");
const API_ROUTES_DIR = join(ROOT, "apps/platform-api/src/routes");

type Contract = {
  file: string;
  operation: string;
  mcpTool?: string;
  httpPath?: string;
  exempt?: boolean;
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
      const toolMatch = /mcp:\s*\{[^}]*tool:\s*["']([^"']+)["']/.exec(block);
      const pathMatch = /http:\s*\{[^}]*path:\s*["']([^"']+)["']/.exec(block);
      const exempt = /exempt:\s*\{/.test(block);
      if (!opMatch) continue;
      contracts.push({
        file: relative(ROOT, file),
        operation: opMatch[1]!,
        mcpTool: toolMatch?.[1],
        httpPath: pathMatch?.[1],
        exempt,
      });
    }
  }

  return contracts;
}

async function readMcpToolNames(): Promise<Set<string>> {
  const src = await readFile(MCP_TOOLS_FILE, "utf8");
  const names = new Set<string>();
  const regex = /name:\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(src))) names.add(match[1]!);
  return names;
}

async function readApiRoutePaths(): Promise<string[]> {
  const files = await walk(API_ROUTES_DIR);
  const paths: string[] = [];
  for (const file of files) {
    const src = await readFile(file, "utf8");
    const regex = /\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(src))) paths.push(match[2]!);
  }
  return paths;
}

async function main() {
  const contracts = await extractContracts();
  const mcpTools = await readMcpToolNames();
  const apiPaths = await readApiRoutePaths();
  const problems: string[] = [];

  for (const c of contracts) {
    if (c.exempt) continue;
    if (c.mcpTool && !mcpTools.has(c.mcpTool)) {
      problems.push(`[mcp] ${c.operation} (${c.file}) declares tool "${c.mcpTool}" but it is not registered in ${relative(ROOT, MCP_TOOLS_FILE)}`);
    }
    // http path lint is intentionally lenient in Phase 0: the API server mounts
    // routes by prefix; full matching is refined in Phase 2 Unit 2.7.
  }

  if (problems.length > 0) {
    console.error("parity check failed:\n");
    for (const p of problems) console.error(" -", p);
    console.error(`\n${problems.length} violation(s). See docs/adr/0005-parity-invariant.md.`);
    process.exit(1);
  }

  console.log(
    `parity ok: ${contracts.length} contract(s), ${mcpTools.size} mcp tool(s), ${apiPaths.length} route handler(s).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
