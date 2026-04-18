import { describe, expect, it } from "vitest";
import { createTenantContract } from "./index";

describe("tenants.create contract", () => {
  it("exposes operation, http, mcp, and webhook metadata", () => {
    expect(createTenantContract.operation).toBe("tenants.create");
    expect(createTenantContract.http?.method).toBe("POST");
    expect(createTenantContract.mcp?.tool).toBe("create_tenant");
    expect(createTenantContract.webhook?.event).toBe("tenant.created");
  });
});
