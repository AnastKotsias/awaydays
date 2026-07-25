import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { notFound } from "../middleware/errors.js";
import { SpotCategory } from "../generated/prisma/enums.js";
import { boundingBox, distanceInMetres } from "../lib/geo.js";
import { toEventDto, toSpotDto, toStadiumDto } from "../lib/serialize.js";

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
      // Total spots logged here, independent of any radius filter — the
      // header shows it next to the capacity.
      _count: { select: { spots: true } },
    },
  });

  if (!stadium) {
    throw notFound(`No stadium with slug "${slug}"`);
  }

  res.json({
    data: {
      ...toStadiumDto(stadium),
      spotCount: stadium._count.spots,
      events: stadium.events.map((event) => toEventDto(event)),
    },
  });
});

const spotsQuery = z.object({
  /** One or more categories, comma separated: ?category=PUB,SPORTS_BAR */
  category: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.length > 0),
    )
    .pipe(z.array(z.enum(SpotCategory)).min(1))
    .optional(),
  /** Search radius in metres. 2 km is comfortable walking distance. */
  radius: z.coerce.number().int().min(100).max(20_000).default(2_000),
  /** Keep only spots at or below this price level (1 cheap … 3 pricey). */
  maxPrice: z.coerce.number().int().min(1).max(3).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/**
 * GET /api/stadiums/:slug/spots
 * GET /api/stadiums/:slug/spots?category=SPORTS_BAR,PUB&radius=1000&maxPrice=2
 *
 * Bars, food and meeting points around a ground, nearest first.
 *
 * Two-step search: PostgreSQL narrows candidates with an index-friendly
 * bounding box, then haversine gives the exact circular distance in
 * JavaScript. See lib/geo.ts for why it is split that way.
 */
stadiumsRouter.get("/:slug/spots", async (req, res) => {
  const { slug } = slugParam.parse(req.params);
  const { category, radius, maxPrice, limit } = spotsQuery.parse(req.query);

  const stadium = await prisma.stadium.findUnique({ where: { slug } });

  if (!stadium) {
    throw notFound(`No stadium with slug "${slug}"`);
  }

  const box = boundingBox(stadium, radius);

  const candidates = await prisma.spot.findMany({
    where: {
      stadiumId: stadium.id,
      ...(category ? { category: { in: category } } : {}),
      ...(maxPrice ? { priceLevel: { lte: maxPrice } } : {}),
      latitude: { gte: box.minLatitude, lte: box.maxLatitude },
      longitude: { gte: box.minLongitude, lte: box.maxLongitude },
    },
  });

  const withinRadius = candidates
    .map((spot) => ({ spot, distance: distanceInMetres(stadium, spot) }))
    // The bounding box lets through the corners of the rectangle; this drops
    // anything that is inside the box but outside the circle.
    .filter(({ distance }) => distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  res.json({
    data: withinRadius.map(({ spot, distance }) => toSpotDto(spot, distance)),
    meta: {
      stadium: toStadiumDto(stadium),
      radius,
      count: withinRadius.length,
    },
  });
});
