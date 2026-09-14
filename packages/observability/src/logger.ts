import pino, { type Logger, type LoggerOptions } from "pino";

type LoggerConfig = {
  service: string;
  env: "development" | "test" | "production";
  level?: "fatal" | "error" | "warn" | "info" | "debug" | "trace";
};

export function createLogger({ service, env, level }: LoggerConfig): Logger {
  const options: LoggerOptions = {
    name: service,
    level: level ?? (env === "production" ? "info" : "debug"),
    base: { service, env },
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "*.password",
        "*.secret",
        "*.token",
        "*.apiKey",
      ],
      censor: "[REDACTED]",
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: () => `,"time":"${new Date().toISOString()}"`,
  };

  if (env !== "production") {
    options.transport = {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:HH:MM:ss.l" },
    };
  }

  return pino(options);
}

export type { Logger };
