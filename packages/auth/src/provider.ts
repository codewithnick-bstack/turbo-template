import type { TUser } from "@repo/schemas";

export type AuthProvider = {
  name: "workos" | "clerk" | "mock";
  verifyToken(token: string): Promise<{ userId: string; providerUserId: string } | null>;
  getUser(providerUserId: string): Promise<TUser | null>;
  createInvite(options: { email: string; tenantId: string; role: string }): Promise<{ url: string }>;
  revokeSession(userId: string): Promise<void>;
};
