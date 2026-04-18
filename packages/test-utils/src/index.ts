import { randomUUID } from "node:crypto";

export function tenantFactory(overrides: Partial<{ slug: string; name: string; plan: string }> = {}) {
  return {
    id: randomUUID(),
    slug: overrides.slug ?? `tenant-${randomUUID().slice(0, 8)}`,
    name: overrides.name ?? "Test Tenant",
    type: "direct" as const,
    plan: (overrides.plan ?? "starter") as "starter" | "pro" | "agency",
    status: "active" as const,
    parentTenantId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function userFactory(overrides: Partial<{ email: string; name: string }> = {}) {
  return {
    id: randomUUID(),
    email: overrides.email ?? `user-${randomUUID().slice(0, 8)}@test.local`,
    name: overrides.name ?? "Test User",
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function randomSlug() {
  return `t-${randomUUID().slice(0, 8)}`;
}
