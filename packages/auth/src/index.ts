import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { type Db, schema } from "@repo/db";

export type BetterAuthOptions = {
  db: Db;
  secret: string;
  baseUrl: string;
  trustedOrigins?: string[];
  resendApiKey?: string;
  fromEmail?: string;
};

export function createBetterAuth(options: BetterAuthOptions) {
  return betterAuth({
    secret: options.secret,
    baseURL: options.baseUrl,
    trustedOrigins: options.trustedOrigins ?? [],
    database: drizzleAdapter(options.db, { provider: "pg", schema }),
    emailAndPassword: {
      enabled: true,
    },
    ...(options.resendApiKey && {
      emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${options.resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: options.fromEmail ?? "noreply@example.com",
              to: user.email,
              subject: "Verify your email",
              html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
            }),
          });
        },
      },
    }),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    },
  });
}

export type Auth = ReturnType<typeof createBetterAuth>;
