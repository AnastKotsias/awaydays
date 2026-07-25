import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { notFound } from "../middleware/errors.js";
import { Sport } from "../generated/prisma/enums.js";
import { toEventDto } from "../lib/serialize.js";

export const eventsRouter = Router();

const listQuery = z.object({
  sport: z.enum(Sport).optional(),
  /** Restrict to one ground, by slug. */
  stadium: z.string().trim().min(1).optional(),
  /** Set to "false" to include fixtures that have already been played. */
  upcoming: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/**
 * GET /api/events
 * GET /api/events?sport=BASKETBALL&stadium=sef&limit=10
 *
 * The fixture list that drives "pick your away day". Defaults to upcoming
 * games only, soonest first.
 */
eventsRouter.get("/", async (req, res) => {
  const { sport, stadium, upcoming, limit } = listQuery.parse(req.query);

  const events = await prisma.event.findMany({
    where: {
      ...(sport ? { sport } : {}),
      ...(stadium ? { stadium: { slug: stadium } } : {}),
      ...(upcoming ? { kickoffAt: { gte: new Date() } } : {}),
    },
    orderBy: { kickoffAt: "asc" },
    take: limit,
    include: { stadium: true },
  });

  res.json({ data: events.map(toEventDto) });
});

const idParam = z.object({ id: z.uuid("Not a valid event id") });

/** GET /api/events/:id — one fixture, including the ground it is played at. */
eventsRouter.get("/:id", async (req, res) => {
  const { id } = idParam.parse(req.params);

  const event = await prisma.event.findUnique({
    where: { id },
    include: { stadium: true },
  });

  if (!event) {
    throw notFound(`No event with id "${id}"`);
  }

  res.json({ data: toEventDto(event) });
});
