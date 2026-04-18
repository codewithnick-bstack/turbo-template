export const env = {
  PLATFORM_API_URL: process.env.PLATFORM_API_URL ?? "http://localhost:4100",
  DEV_TENANT_ID: process.env.DEV_TENANT_ID ?? "dev-tenant-id",
  DEV_USER_ID: process.env.DEV_USER_ID ?? "dev-user-id",
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
