import type {
  EventModel,
  ItineraryItemModel,
  ItineraryModel,
  SpotModel,
  StadiumModel,
} from "../generated/prisma/models.js";
import { toEventDto, toSpotDto, toStadiumDto } from "./serialize.js";

export type ItineraryDto = {
  id: string;
  shareId: string;
  title: string;
  isPublic: boolean;
  event: ReturnType<typeof toEventDto>;
  stadium: ReturnType<typeof toStadiumDto>;
  items: Array<{
    id: string;
    visitOrder: number;
    note: string | null;
    spot: ReturnType<typeof toSpotDto>;
  }>;
  createdAt: string;
  updatedAt: string;
};

type ItineraryWithRelations = ItineraryModel & {
  event: EventModel & { stadium: StadiumModel };
  items: Array<ItineraryItemModel & { spot: SpotModel }>;
};

export function toItineraryDto(
  itinerary: ItineraryWithRelations,
): ItineraryDto {
  return {
    id: itinerary.id,
    shareId: itinerary.shareId,
    title: itinerary.title,
    isPublic: itinerary.isPublic,
    event: toEventDto(itinerary.event),
    stadium: toStadiumDto(itinerary.event.stadium),
    items: itinerary.items.map((item) => ({
      id: item.id,
      visitOrder: item.visitOrder,
      note: item.note,
      spot: toSpotDto(item.spot),
    })),
    createdAt: itinerary.createdAt.toISOString(),
    updatedAt: itinerary.updatedAt.toISOString(),
  };
}
