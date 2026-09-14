import cors from "cors";
import { env } from "../env";

export const corsMiddleware = cors({
  origin: [env.WEB_URL, env.ADMIN_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
  maxAge: 86400,
});
