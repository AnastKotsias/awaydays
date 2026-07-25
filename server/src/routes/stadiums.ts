import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { notFound } from "../middleware/errors.js";
import { toEventDto, toStadiumDto } from "../lib/serialize.js";

export const stadiumsRouter = Router();

const listQuery = z.object({
  city: z.string().trim().min(1).optional(),
  /** Free-text search across stadium name and city. */
  q: z.string().trim().min(1).optional(),
});

/**
 * GET /api/stadiums
 * GET /api/stadiums?city=Piraeus
 * GET /api/stadiums?q=toumba
 *
 * Every stadium, with how many upcoming fixtures and nearby spots it has —
 * enough for the browse page without a second round trip.
 */
stadiumsRouter.get("/", async (req, res) => {
  const { city, q } = listQuery.parse(req.query);

  const stadiums = await prisma.stadium.findMany({
    where: {
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          spots: true,
          // Count only fixtures that have not happened yet.
          events: { where: { kickoffAt: { gte: new Date() } } },
        },
      },
    },
  });

  res.json({
    data: stadiums.map((stadium) => ({
      ...toStadiumDto(stadium),
      spotCount: stadium._count.spots,
      upcomingEventCount: stadium._count.events,
    })),
  });
});

const slugParam = z.object({ slug: z.string().trim().min(1) });

/**
 * GET /api/stadiums/:slug
 *
 * One stadium plus its upcoming fixtures. Looked up by slug ("oaka") rather
 * than uuid so the URL is readable and shareable.
 */
stadiumsRouter.get("/:slug", async (req, res) => {
  const { slug } = slugParam.parse(req.params);

  const stadium = await prisma.stadium.findUnique({
    where: { slug },
    include: {
      events: {
        where: { kickoffAt: { gte: new Date() } },
        orderBy: { kickoffAt: "asc" },
      },
    },
  });

  if (!stadium) {
    throw notFound(`No stadium with slug "${slug}"`);
  }

  res.json({
    data: {
      ...toStadiumDto(stadium),
      events: stadium.events.map((event) => toEventDto(event)),
    },
  });
});
