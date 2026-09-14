import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDb } from "./client";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const { db, close } = createDb({ url });
  try {
    await migrate(db, { migrationsFolder: "migrations" });
    console.log("migrations applied");
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
