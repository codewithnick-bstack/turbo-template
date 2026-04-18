import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type ClientOptions = {
  url: string;
  poolMax?: number;
  ssl?: boolean;
};

export function createDb(options: ClientOptions) {
  const sql = postgres(options.url, {
    max: options.poolMax ?? 10,
    ssl: options.ssl ? "require" : undefined,
    prepare: false,
  });

  return {
    db: drizzle(sql, { schema }),
    close: () => sql.end({ timeout: 5 }),
  };
}

export type Db = ReturnType<typeof createDb>["db"];
