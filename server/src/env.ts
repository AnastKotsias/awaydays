import "dotenv/config";
import { z } from "zod";

/**
 * Every environment variable the server needs, described once.
 *
 * Validating configuration at startup means a typo in `.env` fails immediately
 * with a clear message, instead of surfacing later as a confusing runtime error
 * (e.g. `undefined` sneaking into a database URL).
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  console.error("\nDid you forget to run `cp .env.example .env`?");
  process.exit(1);
}

export const env = parsed.data;
