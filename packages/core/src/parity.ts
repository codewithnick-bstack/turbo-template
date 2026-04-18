/**
 * Parity metadata attached to every exported service function.
 * Consumed by `scripts/verify-parity.ts` to enforce ADR 0005.
 */
export type ParityContract = {
  operation: string;
  description: string;
  destructive?: boolean;
  idempotent?: boolean;
  http?: { method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; path: string };
  mcp?: { tool: string; requiresApproval?: boolean };
  webhook?: { event: string };
  exempt?: { reason: string };
};

export function defineContract<T extends ParityContract>(contract: T): T {
  return contract;
}
