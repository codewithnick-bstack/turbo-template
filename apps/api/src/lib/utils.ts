export function parsePaginationParams(query: Record<string, unknown>, maxLimit = 100): { limit: number; offset: number } {
  const rawLimit = parseInt(String(query.limit ?? "50"), 10);
  const rawOffset = parseInt(String(query.offset ?? "0"), 10);
  const limit = Number.isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), maxLimit);
  const offset = Number.isNaN(rawOffset) ? 0 : Math.max(rawOffset, 0);
  return { limit, offset };
}

// Strip undefined values from an object.
// Returns `any` to avoid exactOptionalPropertyTypes conflicts with Drizzle ORM
// which uses `T | null` for nullable columns but Zod generates `T | undefined` for optional fields.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compact<T extends object>(obj: T): any {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}
