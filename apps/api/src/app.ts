import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { z } from "zod";

import { env } from "./env";
import { deliverContactEmail } from "./lib/mailer";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  message: z.string().min(20),
});

const app: express.Express = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.NODE_ENV === "production" ? env.WEB_ORIGIN : true,
    credentials: false,
  }),
);
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(
  "/api",
  rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "client-websites-api",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/contact", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Invalid contact payload.",
      details: parsed.error.flatten(),
    });
  }

  const delivery = await deliverContactEmail(parsed.data);

  return res.status(200).json({
    ok: true,
    message: "Inquiry received successfully.",
    deliveryMode: delivery.mode,
  });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ ok: false, error: "Internal server error." });
});

export default app;
