export default function CliPage() {
  return (
    <article>
      <h1>CLI</h1>
      <p>
        <code>packages/cli</code> provides the <code>platform</code> command for scripting,
        CI/CD pipelines, and agent-driven automation.
      </p>

      <h2>Usage</h2>
      <Pre>{`# set env (or pass --api / --key flags)
export PLATFORM_API_URL=http://localhost:4100
export PLATFORM_API_KEY=your-key

# sites
platform sites list
platform sites create --name "My Site" --slug my-site

# pages
platform pages list <siteId>
platform pages publish <pageId>

# blog
platform blog list <siteId>
platform blog publish <postId>

# analytics
platform analytics get <siteId> --days 30

# search
platform search "contact us"

# templates
platform templates list
platform templates use <templateId> --name "New" --slug new

# members
platform members list
platform members invite user@example.com --role editor`}</Pre>

      <h2>Options (all commands)</h2>
      <Pre>{`--api <url>   Override API base URL
--key <key>   Override API key`}</Pre>
    </article>
  );
}

function Pre({ children }: { children: string }) {
  return <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: 16, borderRadius: 8, fontSize: 13, overflowX: "auto", margin: "12px 0" }}><code>{children}</code></pre>;
}
