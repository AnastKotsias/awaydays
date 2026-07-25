import type { SpotCategory, Sport } from "@/api/types";

/**
 * Presentation details for each spot category, in one place.
 *
 * `colour` is a CSS variable rather than a hex value on purpose: it resolves
 * against whichever theme is active, so chips, list rails and map pins all
 * follow the dark/light toggle without any JavaScript re-computing colours.
 * That works inside Leaflet marker HTML too, because those elements live in
 * the same document and inherit from :root.
 */
export const CATEGORY_META: Record<
  SpotCategory,
  { label: string; colour: string; initial: string }
> = {
  SPORTS_BAR: { label: "Sports bar", colour: "var(--c-bar)", initial: "S" },
  LOCAL_FOOD: { label: "Local food", colour: "var(--c-food)", initial: "L" },
  FAN_MEETING_POINT: {
    label: "Meeting point",
    colour: "var(--c-meet)",
    initial: "M",
  },
  PUB: { label: "Pub", colour: "var(--c-pub)", initial: "P" },
  CAFE: { label: "Café", colour: "var(--c-cafe)", initial: "C" },
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_META) as SpotCategory[];

export const SPORT_LABEL: Record<Sport, string> = {
  FOOTBALL: "Football",
  BASKETBALL: "Basketball",
};

/**
 * How long people actually spend in each kind of place, in minutes.
 * Used to schedule the itinerary backwards from kick-off.
 */
export const DWELL_MINUTES: Record<SpotCategory, number> = {
  FAN_MEETING_POINT: 20,
  CAFE: 35,
  LOCAL_FOOD: 60,
  SPORTS_BAR: 50,
  PUB: 45,
};

/** 428 -> "430 m", 1104 -> "1.1 km" */
export function formatDistance(metres: number): string {
  if (metres < 1000) {
    return `${Math.round(metres / 10) * 10} m`;
  }
  return `${(metres / 1000).toFixed(1)} km`;
}

/**
 * Walking time for a distance, at roughly 4.6 km/h — a realistic matchday
 * pace through a crowd rather than an empty-pavement figure.
 */
export function walkMinutes(metres: number): number {
  return Math.max(1, Math.round((metres / 1000) * 13));
}

/** 2 -> "€€" */
export function formatPrice(priceLevel: number | null): string {
  return priceLevel ? "€".repeat(priceLevel) : "—";
}

/** 69618 -> "69,618" */
export function formatNumber(value: number): string {
  return value.toLocaleString("en-GB");
}

/** "01" for 1 — the design sets these as display numerals. */
export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** "2026-08-04T18:00Z" -> "TUE 4 AUG" */
export function formatShortDate(isoDate: string): string {
  return new Date(isoDate)
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();
}

/** "2026-08-04T18:00Z" -> "Tuesday 4 August" */
export function formatLongDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** "2026-08-04T18:00Z" -> "21:00" in the reader's timezone */
export function formatClock(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

/** A Date -> "18:45" */
export function formatTimeOfDay(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
