import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";

/**
 * Builds the Express application.
 *
 * Kept separate from `index.ts` (which actually opens the port) so that tests
 * can create an app instance without starting a real server.
 */
export function createApp() {
  const app = express();

  // The browser refuses cross-origin requests unless the API opts in.
  // In development the client runs on :5173 and the API on :4000.
  app.use(cors({ origin: env.CORS_ORIGIN }));

  // Parse `Content-Type: application/json` request bodies into `req.body`.
  app.use(express.json());

  // A trivial endpoint to confirm the API is alive — useful locally and
  // required by most hosting providers for health checks.
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // Order matters: the 404 handler must come after every real route, and the
  // error handler must be registered last of all.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
