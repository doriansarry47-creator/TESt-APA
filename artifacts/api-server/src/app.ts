import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";

const app: Express = express();

// ── Security headers ────────────────────────────────────────────────────────
app.disable("x-powered-by");

// ── Request logging ─────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["*"];

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: !allowedOrigins.includes("*"),
  }),
);

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── API routes ───────────────────────────────────────────────────────────────
app.use("/api", router);

// ── Static frontend serving (local dev / self-hosted) ───────────────────────
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(
  currentDir,
  "..",
  "..",
  "apa-medical",
  "dist",
  "public",
);
const frontendIndex = path.join(frontendDist, "index.html");

if (fs.existsSync(frontendIndex)) {
  app.use(
    express.static(frontendDist, {
      maxAge: "1y",
      immutable: true,
      index: false, // we handle index manually below for SPA fallback
    }),
  );

  // SPA fallback — serve index.html for all non-API routes
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(frontendIndex);
  });
} else {
  logger.warn({ frontendDist }, "Frontend build not found, static hosting disabled");
}

// ── 404 handler (must come after routes but before error handler) ────────────
app.use(notFoundHandler);

// ── Global error handler (must be LAST) ─────────────────────────────────────
app.use(errorHandler);

export default app;
