import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { badRequest, notFound } from "../middleware/errors.js";
import { toItineraryDto } from "../lib/itineraries.js";

export const itinerariesRouter = Router();

const shareIdParam = z.object({
  shareId: z.uuid("Not a valid share id"),
});

const createBody = z.object({
  title: z.string().trim().min(1).max(120).default("Away day"),
  eventId: z.uuid("Not a valid event id"),
  spotIds: z.array(z.uuid("Not a valid spot id")).max(50).default([]),
  isPublic: z.boolean().default(true),
});

const updateBody = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    spotIds: z.array(z.uuid("Not a valid spot id")).max(50).optional(),
    isPublic: z.boolean().optional(),
  })
  .refine(
    (body) =>
      body.title !== undefined ||
      body.spotIds !== undefined ||
      body.isPublic !== undefined,
    { message: "At least one field must be provided" },
  );

const itineraryInclude = {
  event: { include: { stadium: true } },
  items: {
    orderBy: { visitOrder: "asc" as const },
    include: { spot: true },
  },
} as const;

async function validateSpotsForEvent(eventId: string, spotIds: string[]) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { stadium: true },
  });

  if (!event) {
    throw notFound(`No event with id "${eventId}"`);
  }

  const uniqueSpotIds = new Set(spotIds);
  if (uniqueSpotIds.size !== spotIds.length) {
    throw badRequest("spotIds must not contain duplicates");
  }

  const spots = await prisma.spot.findMany({
    where: { id: { in: spotIds } },
  });

  if (spots.length !== spotIds.length) {
    throw badRequest("Every spot must exist");
  }

  if (spots.some((spot) => spot.stadiumId !== event.stadiumId)) {
    throw badRequest("Every spot must belong to the event stadium");
  }

  return event;
}

itinerariesRouter.post("/", async (req, res) => {
  const body = createBody.parse(req.body);
  await validateSpotsForEvent(body.eventId, body.spotIds);

  const itinerary = await prisma.itinerary.create({
    data: {
      title: body.title,
      isPublic: body.isPublic,
      eventId: body.eventId,
      items: {
        create: body.spotIds.map((spotId, index) => ({
          spotId,
          visitOrder: index + 1,
        })),
      },
    },
    include: itineraryInclude,
  });

  res.status(201).json({ data: toItineraryDto(itinerary) });
});

itinerariesRouter.get("/:shareId", async (req, res) => {
  const { shareId } = shareIdParam.parse(req.params);
  const itinerary = await prisma.itinerary.findUnique({
    where: { shareId },
    include: itineraryInclude,
  });

  if (!itinerary || !itinerary.isPublic) {
    throw notFound(`No public itinerary with share id "${shareId}"`);
  }

  res.json({ data: toItineraryDto(itinerary) });
});

itinerariesRouter.patch("/:shareId", async (req, res) => {
  const { shareId } = shareIdParam.parse(req.params);
  const body = updateBody.parse(req.body);

  const existing = await prisma.itinerary.findUnique({
    where: { shareId },
  });
  if (!existing) {
    throw notFound(`No itinerary with share id "${shareId}"`);
  }

  if (body.spotIds !== undefined) {
    await validateSpotsForEvent(existing.eventId, body.spotIds);
  }

  const itinerary = await prisma.$transaction(async (transaction) => {
    if (body.spotIds !== undefined) {
      await transaction.itineraryItem.deleteMany({
        where: { itineraryId: existing.id },
      });
    }

    return transaction.itinerary.update({
      where: { id: existing.id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.isPublic !== undefined ? { isPublic: body.isPublic } : {}),
        ...(body.spotIds !== undefined
          ? {
              items: {
                create: body.spotIds.map((spotId, index) => ({
                  spotId,
                  visitOrder: index + 1,
                })),
              },
            }
          : {}),
      },
      include: itineraryInclude,
    });
  });

  res.json({ data: toItineraryDto(itinerary) });
});

itinerariesRouter.delete("/:shareId", async (req, res) => {
  const { shareId } = shareIdParam.parse(req.params);
  const result = await prisma.itinerary.deleteMany({ where: { shareId } });

  if (result.count === 0) {
    throw notFound(`No itinerary with share id "${shareId}"`);
  }

  res.status(204).send();
});
