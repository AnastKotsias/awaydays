import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Configuration for the Prisma CLI (`prisma migrate`, `prisma db seed`, ...).
 *
 * In Prisma 7 the connection string lives here rather than in schema.prisma,
 * and `.env` is only read because of the `dotenv/config` import above.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // The seed lives under src/ so it is covered by `npm run typecheck`
    // and compiled by `npm run build` like the rest of the code.
    seed: "tsx src/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
