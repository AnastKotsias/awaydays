import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

/**
 * The one and only database connection for this process.
 *
 * Each `PrismaClient` creates its own connection pool, so creating a new one
 * per request would exhaust PostgreSQL's connection limit very quickly.
 * Everything else in the app imports this instance.
 *
 * Prisma 7 talks to PostgreSQL through a driver adapter (`@prisma/adapter-pg`)
 * rather than a bundled binary engine.
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  // Surface slow or unexpected queries while developing; stay quiet otherwise.
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

/** Closes the pool so the process can exit cleanly (used on shutdown). */
export async function disconnectDb() {
  await prisma.$disconnect();
}
