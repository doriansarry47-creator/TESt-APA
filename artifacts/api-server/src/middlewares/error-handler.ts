import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

/**
 * Global error handler middleware.
 * Must be registered LAST (after all routes).
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const status =
    err instanceof Error && "status" in err && typeof err.status === "number"
      ? err.status
      : 500;

  const message =
    err instanceof Error ? err.message : "Internal server error";

  logger.error(
    {
      err,
      method: req.method,
      url: req.url,
      status,
    },
    "Unhandled error",
  );

  if (res.headersSent) return;

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}
