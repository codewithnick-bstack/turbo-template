import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type ClientOptions = {
  url: string;
  poolMax?: number;
  ssl?: boolean;
};

export function createDb(options: ClientOptions) {
  const sqlOptions: Parameters<typeof postgres>[1] = {
    max: options.poolMax ?? 10,
    prepare: false,
  };
  if (options.ssl) sqlOptions.ssl = "require";
  const sql = postgres(options.url, sqlOptions);

  return {
    db: drizzle(sql, { schema }),
    close: () => sql.end({ timeout: 5 }),
  };
}

export type Db = ReturnType<typeof createDb>["db"];
