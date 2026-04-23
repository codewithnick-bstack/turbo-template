import type { Metadata } from "next";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "System Status",
  description: "Real-time status of all Platform services.",
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
  { name: "API", description: "Core REST API and GraphQL endpoints", status: "operational", latencyMs: 38 },
  { name: "Admin", description: "Admin dashboard and UI", status: "operational", latencyMs: 62 },
  { name: "MCP Agent API", description: "Model Context Protocol tool server", status: "operational", latencyMs: 24 },
  { name: "Media CDN", description: "Asset storage and delivery", status: "operational", latencyMs: 11 },
  { name: "Builder", description: "Visual page builder and preview", status: "operational", latencyMs: 89 },
  { name: "Webhooks", description: "Event delivery and retry queue", status: "operational", latencyMs: 44 },
  { name: "Analytics", description: "Site analytics ingestion and queries", status: "operational", latencyMs: 57 },
  { name: "Auth", description: "Authentication and session management", status: "operational", latencyMs: 19 },
];

const RECENT_INCIDENTS: Incident[] = [];

const UPTIME_HISTORY = [
  { month: "Oct 2025", uptime: 99.98 },
  { month: "Nov 2025", uptime: 99.97 },
  { month: "Dec 2025", uptime: 100.0 },
  { month: "Jan 2026", uptime: 99.99 },
  { month: "Feb 2026", uptime: 99.95 },
  { month: "Mar 2026", uptime: 100.0 },
];

function StatusBadge({ status }: { status: ServiceStatus }) {
  const config: Record<ServiceStatus, { label: string; className: string }> = {
    operational: { label: "Operational", className: "bg-green-100 text-green-700" },
    degraded: { label: "Degraded", className: "bg-yellow-100 text-yellow-700" },
    outage: { label: "Outage", className: "bg-red-100 text-red-700" },
    maintenance: { label: "Maintenance", className: "bg-blue-100 text-blue-700" },
  };
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {status === "operational" && <CheckCircle size={10} />}
      {(status === "degraded" || status === "outage") && <AlertCircle size={10} />}
      {status === "maintenance" && <Clock size={10} />}
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
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">System Status</h1>
        <p className="text-[var(--muted)]">Real-time status of all Platform services.</p>
      </div>

      {/* Overall status banner */}
      <div
        className={`rounded-2xl border p-6 mb-10 flex items-center gap-4 ${
          overall === "operational"
            ? "border-green-200 bg-green-50"
            : overall === "degraded"
              ? "border-yellow-200 bg-yellow-50"
              : "border-red-200 bg-red-50"
        }`}
      >
        {overall === "operational" ? (
          <CheckCircle size={28} className="text-green-600 shrink-0" aria-hidden="true" />
        ) : (
          <AlertCircle size={28} className="text-yellow-600 shrink-0" aria-hidden="true" />
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
        <h2 id="services-heading" className="text-xl font-semibold mb-4">Services</h2>
        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
          {SERVICES.map((service) => (
            <div key={service.name} className="flex items-center justify-between px-5 py-4 bg-white dark:bg-[var(--card)]">
              <div>
                <p className="font-medium text-sm">{service.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{service.description}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {service.latencyMs && (
                  <span className="text-xs text-[var(--muted)] tabular-nums hidden sm:block">
                    {service.latencyMs}ms
                  </span>
                )}
                <StatusBadge status={service.status} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active incidents */}
      <section aria-labelledby="incidents-heading" className="mb-10">
        <h2 id="incidents-heading" className="text-xl font-semibold mb-4">Active Incidents</h2>
        {RECENT_INCIDENTS.filter((i) => i.status !== "resolved").length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-4">No active incidents.</p>
        ) : (
          <div className="space-y-4">
            {RECENT_INCIDENTS.filter((i) => i.status !== "resolved").map((incident) => (
              <div key={incident.id} className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{incident.title}</p>
                  <span className="text-xs font-medium bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full capitalize">
                    {incident.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">Started: {incident.startedAt}</p>
                <ul className="mt-3 space-y-2">
                  {incident.updates.map((u, i) => (
                    <li key={i} className="text-sm">
                      <span className="text-[var(--muted)] text-xs">{u.timestamp} — </span>
                      {u.message}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Uptime history */}
      <section aria-labelledby="uptime-heading">
        <h2 id="uptime-heading" className="text-xl font-semibold mb-4">Historical Uptime</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left pb-2 font-medium text-[var(--muted)]">Month</th>
                <th className="text-right pb-2 font-medium text-[var(--muted)]">Uptime</th>
                <th className="text-right pb-2 font-medium text-[var(--muted)] hidden sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {UPTIME_HISTORY.map((row) => (
                <tr key={row.month}>
                  <td className="py-2.5">{row.month}</td>
                  <td className="py-2.5 text-right tabular-nums">{row.uptime.toFixed(2)}%</td>
                  <td className="py-2.5 text-right hidden sm:table-cell">
                    <span className={`text-xs font-medium ${row.uptime >= 99.9 ? "text-green-600" : "text-yellow-600"}`}>
                      {row.uptime >= 99.9 ? "Meets SLA" : "Below SLA"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--muted)] mt-4">SLA target: 99.9% monthly uptime for Pro and Agency plans.</p>
      </section>
    </main>
  );
}
