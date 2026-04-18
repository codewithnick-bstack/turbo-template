import { describe, expect, it } from "vitest";
import { checkEntitlement } from "./entitlements";

const zeroUsage = {
  sites: 0,
  seats: 0,
  formSubmissionsThisMonth: 0,
  aiTokensThisMonth: 0,
};

describe("checkEntitlement", () => {
  it("allows site creation under quota", () => {
    const d = checkEntitlement("starter", "sites.create", zeroUsage);
    expect(d.allowed).toBe(true);
  });

  it("blocks seats.invite at quota and points to next tier", () => {
    const d = checkEntitlement("starter", "seats.invite", { ...zeroUsage, seats: 2 });
    expect(d.allowed).toBe(false);
    if (!d.allowed) {
      expect(d.reason).toBe("quota_exhausted");
      expect(d.upgrade).toBe("pro");
    }
  });

  it("requires Agency plan to resell", () => {
    const d = checkEntitlement("pro", "reseller.enable", zeroUsage);
    expect(d.allowed).toBe(false);
    if (!d.allowed) {
      expect(d.reason).toBe("plan_required");
      expect(d.upgrade).toBe("agency");
    }
  });
});
