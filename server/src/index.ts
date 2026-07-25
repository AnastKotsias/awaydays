import { createApp } from "./app.js";
import { disconnectDb } from "./db.js";
import { env } from "./env.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Away Days API listening on http://localhost:${env.PORT}`);
});

/**
 * Close the HTTP server and the database pool when the process is asked to
 * stop, so in-flight requests finish and no connection is left dangling.
 */
function shutdown(signal: string) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(async () => {
    await disconnectDb();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
