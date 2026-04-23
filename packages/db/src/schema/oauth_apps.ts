import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const oauthApps = pgTable(
  "oauth_apps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    name: text("name").notNull(),
    description: text("description"),
    clientId: text("client_id").notNull().unique(),
    clientSecret: text("client_secret").notNull(),
    redirectUris: jsonb("redirect_uris").$type<string[]>().notNull().default([]),
    scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
    homepageUrl: text("homepage_url"),
    logoUrl: text("logo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    tenantIdx: index("oauth_apps_tenant_idx").on(t.tenantId),
    clientIdIdx: index("oauth_apps_client_id_idx").on(t.clientId),
  }),
);

export const oauthGrants = pgTable(
  "oauth_grants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    appId: uuid("app_id")
      .notNull()
      .references(() => oauthApps.id),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id),
    userId: uuid("user_id").notNull(),
    scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
    codeHash: text("code_hash"),
    codeChallenge: text("code_challenge"),
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    appIdx: index("oauth_grants_app_idx").on(t.appId),
    tenantIdx: index("oauth_grants_tenant_idx").on(t.tenantId),
    codeHashIdx: index("oauth_grants_code_hash_idx").on(t.codeHash),
    accessTokenIdx: index("oauth_grants_access_token_idx").on(t.accessToken),
  }),
);
