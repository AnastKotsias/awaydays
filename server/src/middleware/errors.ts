import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../env.js";

/**
 * An error we raised deliberately, with the HTTP status the client should see.
 * Anything else that reaches the error handler is treated as a bug (500).
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** Convenience constructors for the statuses this API actually uses. */
export const badRequest = (message: string) => new HttpError(400, message);
export const notFound = (message: string) => new HttpError(404, message);

/** Runs when no route matched the request at all. */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: `No route matches ${req.method} ${req.originalUrl}`,
  });
}

/**
 * The single place where errors become HTTP responses.
 *
 * Express 5 forwards rejected promises from async route handlers here
 * automatically, so route code can simply `throw` instead of wrapping
 * everything in try/catch.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // Express only recognises a function as an error handler if it declares
  // four parameters, so `next` must stay even though it is unused.
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Invalid request",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Unexpected: log the real thing for us, return something generic to the client.
  console.error("Unhandled error:", err);
  res.status(500).json({
    error:
      env.NODE_ENV === "production"
        ? "Internal server error"
        : err instanceof Error
          ? err.message
          : String(err),
  });
}
