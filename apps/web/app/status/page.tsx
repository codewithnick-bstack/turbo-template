import type { Metadata } from "next";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "System Status",
  description: "Uptime for the systems this site depends on.",
  // Operational page for the owner, not for search. It names internal
  // services, so keep it out of the index and off every crawl path.
  robots: { index: false, follow: false },
  alternates: { canonical: "/status" },
  openGraph: {
    title: "System Status",
    description: "Uptime for the systems this site depends on.",
    url: "/status",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "System Status",
    description: "Uptime for the systems this site depends on.",
  },
};

type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

type Service = {
  name: string;
  description: string;
  status: ServiceStatus;
  latencyMs?: number;
};

type IncidentUpdate = {
  timestamp: string;
  message: string;
};

type Incident = {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  startedAt: string;
  resolvedAt?: string;
  updates: IncidentUpdate[];
};

const SERVICES: Service[] = [
  {
    name: "Web",
    description: "Public website (Next.js)",
    status: "operational",
  },
  {
    name: "Admin CMS",
    description: "Admin dashboard (Next.js)",
    status: "operational",
  },
  {
    name: "API",
    description: "Express REST API + MCP server",
    status: "operational",
  },
  { name: "Database", description: "Postgres (Neon)", status: "operational" },
];

const RECENT_INCIDENTS: Incident[] = [];

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config: Record<ServiceStatus, { label: string; className: string }> = {
    operational: {
      label: "Operational",
      className: "bg-green-100 text-green-700",
    },
    degraded: { label: "Degraded", className: "bg-yellow-100 text-yellow-700" },
    outage: { label: "Outage", className: "bg-red-100 text-red-700" },
    maintenance: {
      label: "Maintenance",
      className: "bg-blue-100 text-blue-700",
    },
  };
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {status === "operational" && <CheckCircle size={10} aria-hidden="true" />}
      {(status === "degraded" || status === "outage") && (
        <AlertCircle size={10} aria-hidden="true" />
      )}
      {status === "maintenance" && <Clock size={10} aria-hidden="true" />}
      {label}
    </span>
  );
}

function overallStatus(services: Service[]): ServiceStatus {
  if (services.some((s) => s.status === "outage")) return "outage";
  if (services.some((s) => s.status === "degraded")) return "degraded";
  if (services.some((s) => s.status === "maintenance")) return "maintenance";
  return "operational";
}

export default function StatusPage() {
  const overall = overallStatus(SERVICES);

  return (
    <main className="page-offset mx-auto max-w-3xl px-4 py-16 lg:py-20">
      <div className="mb-12 text-center">
        <p className="eyebrow">Operations</p>
        <h1 className="font-display mt-4 text-4xl font-bold tracking-[-0.02em] text-[var(--navy)] dark:text-white">
          System Status
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Uptime for the systems this site depends on.
        </p>
      </div>

      {/* Overall status banner */}
      <div
        className={`border p-6 mb-10 flex items-center gap-4 ${
          overall === "operational"
            ? "border-green-200 bg-green-50"
            : overall === "degraded"
              ? "border-yellow-200 bg-yellow-50"
              : "border-red-200 bg-red-50"
        }`}
      >
        {overall === "operational" ? (
          <CheckCircle
            size={28}
            className="text-green-600 shrink-0"
            aria-hidden="true"
          />
        ) : (
          <AlertCircle
            size={28}
            className="text-yellow-600 shrink-0"
            aria-hidden="true"
          />
        )}
        <div>
          <p className="font-semibold text-lg">
            {overall === "operational"
              ? "All systems operational"
              : overall === "degraded"
                ? "Partial system degradation"
                : "Service disruption in progress"}
          </p>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Last updated: {new Date().toUTCString()}
          </p>
        </div>
      </div>

      {/* Service list */}
      <section aria-labelledby="services-heading" className="mb-10">
        <h2 id="services-heading" className="text-xl font-semibold mb-4">
          Services
        </h2>
        <div className="divide-y divide-[var(--border)] border border-[var(--border)]">
          {SERVICES.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between px-5 py-4 bg-white dark:bg-[var(--card)]"
            >
              <div>
                <p className="font-medium text-sm">{service.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {service.description}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <StatusBadge status={service.status} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active incidents */}
      <section aria-labelledby="incidents-heading" className="mb-10">
        <h2 id="incidents-heading" className="text-xl font-semibold mb-4">
          Active Incidents
        </h2>
        {RECENT_INCIDENTS.filter((i) => i.status !== "resolved").length ===
        0 ? (
          <p className="text-sm text-[var(--muted)] py-4">
            No active incidents.
          </p>
        ) : (
          <div className="space-y-4">
            {RECENT_INCIDENTS.filter((i) => i.status !== "resolved").map(
              (incident) => (
                <div
                  key={incident.id}
                  className="border border-yellow-200 bg-yellow-50 p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{incident.title}</p>
                    <span className="text-xs font-medium bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full capitalize">
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Started: {incident.startedAt}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {incident.updates.map((u, i) => (
                      <li key={i} className="text-sm">
                        <span className="text-[var(--muted)] text-xs">
                          {u.timestamp} —{" "}
                        </span>
                        {u.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        )}
      </section>

      {/* Monitoring callout */}
      <section aria-labelledby="monitoring-heading">
        <h2 id="monitoring-heading" className="text-xl font-semibold mb-4">
          Monitoring
        </h2>
        <div className="border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-sm text-[var(--muted)]">
            Status shown here is self-reported, not pulled from a live uptime
            monitor yet.
          </p>
        </div>
      </section>
    </main>
  );
}
