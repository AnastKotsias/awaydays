import type { SpotCategory, Sport } from "@/api/types";

/**
 * Presentation details for each spot category, in one place.
 *
 * The list page, the filter buttons and the map markers all read from here,
 * so a category is labelled and coloured identically everywhere — and adding
 * a category to the schema means updating exactly one object.
 */
export const CATEGORY_META: Record<
  SpotCategory,
  { label: string; colour: string; icon: string }
> = {
  SPORTS_BAR: { label: "Sports bar", colour: "#f59e0b", icon: "📺" },
  LOCAL_FOOD: { label: "Local food", colour: "#ef4444", icon: "🍽️" },
  FAN_MEETING_POINT: { label: "Meeting point", colour: "#3b82f6", icon: "🚩" },
  PUB: { label: "Pub", colour: "#a855f7", icon: "🍺" },
  CAFE: { label: "Café", colour: "#14b8a6", icon: "☕" },
};

export const SPORT_LABEL: Record<Sport, string> = {
  FOOTBALL: "Football",
  BASKETBALL: "Basketball",
};

/** 428 -> "430 m", 1104 -> "1.1 km" */
export function formatDistance(metres: number): string {
  if (metres < 1000) {
    return `${Math.round(metres / 10) * 10} m`;
  }
  return `${(metres / 1000).toFixed(1)} km`;
}

/** 2 -> "€€" */
export function formatPrice(priceLevel: number | null): string {
  if (!priceLevel) return "—";
  return "€".repeat(priceLevel);
}

/** "2026-08-04T18:00:00.000Z" -> "Tue 4 Aug, 21:00" (in the user's timezone) */
export function formatKickoff(isoDate: string): string {
  return new Date(isoDate).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "69618" -> "69,618" */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}
