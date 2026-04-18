export default function DocsIndex() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="text-4xl font-bold">Platform Docs</h1>
      <p className="mt-4 text-muted-foreground">
        Generated OpenAPI and MCP reference lands in Phase 6 Unit 6.1. For now, see:
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-6 text-sm">
        <li>
          <a className="underline" href="/adr">
            Architecture Decision Records
          </a>
        </li>
        <li>
          <a className="underline" href="/plans">
            Implementation plans
          </a>
        </li>
      </ul>
    </main>
  );
}
