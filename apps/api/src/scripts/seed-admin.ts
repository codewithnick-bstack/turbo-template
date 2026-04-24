import "dotenv/config";
import { createDb } from "@repo/db";
import { createBetterAuth } from "@repo/auth";
import { env } from "../env";

async function main() {
  const email = env.ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("seed-admin: ADMIN_EMAIL and ADMIN_PASSWORD not set, skipping");
    process.exit(0);
  }

  const { db, close } = createDb({ url: env.DATABASE_URL });
  const auth = createBetterAuth({
    db,
    secret: env.AUTH_SECRET,
    baseUrl: env.API_URL,
  });

  try {
    const res = await auth.api.signUpEmail({
      body: { email, password, name: "Admin" },
    });

    if (!res || !("user" in res)) {
      console.error("seed-admin: unexpected response from signUpEmail", res);
      process.exit(1);
    }

    console.log(`seed-admin: created admin user ${email}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("exist") || msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
      console.log(`seed-admin: admin user ${email} already exists, skipping`);
    } else {
      console.error("seed-admin: failed to create admin user", err);
      process.exit(1);
    }
  } finally {
    await close();
  }
}

main();
