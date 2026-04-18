process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/platform_test";
process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? "test-session-secret-that-is-32-chars-long!";
process.env.NODE_ENV = "test";
