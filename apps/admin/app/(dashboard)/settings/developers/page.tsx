import Link from "next/link";
import { getApiClient } from "../../../../lib/api";
import { DeleteOAuthAppButton } from "./oauth-app-actions";

type OAuthApp = {
  id: string;
  name: string;
  clientId: string;
  scopes: string[];
  createdAt: string;
};

export default async function DevelopersPage() {
  const api = getApiClient();
  let apps: OAuthApp[] = [];

  try {
    const res = await api.oauthApps.list();
    apps = res.data ?? [];
  } catch {
    // API unavailable
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Developer Platform</h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            Register OAuth apps to integrate with the platform API.
          </p>
        </div>
        <Link
          href="/settings/developers/new"
          className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          New app
        </Link>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">
          OAuth Apps
        </h2>
        {apps.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] py-12 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">No OAuth apps yet.</p>
            <Link
              href="/settings/developers/new"
              className="mt-2 inline-block text-sm text-[var(--primary)] hover:underline"
            >
              Register your first app
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-sm">{app.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)] font-mono mt-0.5">
                    {app.clientId}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {app.scopes.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-[var(--border)]/60 px-1.5 py-0.5 rounded"
                      >
                        {s}
                      </span>
                    ))}
                    {app.scopes.length > 4 && (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        +{app.scopes.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                  <DeleteOAuthAppButton appId={app.id} appName={app.name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">
          Available Scopes
        </h2>
        <div className="rounded-lg border border-[var(--border)] divide-y divide-[var(--border)]">
          {[
            ["sites:read", "Read site details and settings"],
            ["sites:write", "Create, update, and delete sites"],
            ["pages:read", "Read page content and status"],
            ["pages:write", "Create, edit, publish, and delete pages"],
            ["content:read", "Read CMS collections and entries"],
            ["content:write", "Create and update CMS entries"],
            ["media:read", "List and read media assets"],
            ["media:write", "Upload and delete media assets"],
            ["members:read", "List team members and invites"],
            ["members:write", "Invite and remove team members"],
            ["analytics:read", "Read site analytics data"],
            ["webhooks:read", "List webhook subscriptions"],
            ["webhooks:write", "Create and delete webhook subscriptions"],
          ].map(([scope, desc]) => (
            <div key={scope} className="flex items-center gap-4 px-4 py-2.5">
              <code className="text-xs font-mono w-36 shrink-0 text-[var(--primary)]">{scope}</code>
              <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
