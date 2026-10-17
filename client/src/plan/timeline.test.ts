import { describe, expect, it } from "vitest";
import type { Spot, Stadium } from "@/api/types";
import { DWELL_MINUTES, walkMinutes } from "@/lib/format";
import { distanceInMetres } from "@/lib/geo";
import { buildTimeline } from "@/plan/timeline";

const stadium: Stadium = {
  id: "stadium-1",
  slug: "test-ground",
  name: "Test Ground",
  city: "Athens",
  country: "Greece",
  blurb: null,
  latitude: 38.0366,
  longitude: 23.7873,
  capacity: null,
  imageUrl: null,
};

const spots: Spot[] = [
  {
    id: "spot-1",
    name: "First stop",
    category: "LOCAL_FOOD",
    description: null,
    address: "One Street",
    latitude: 38.040,
    longitude: 23.7873,
    priceLevel: 2,
    website: null,
  },
  {
    id: "spot-2",
    name: "Second stop",
    category: "PUB",
    description: null,
    address: "Two Street",
    latitude: 38.038,
    longitude: 23.7873,
    priceLevel: 1,
    website: null,
  },
];

describe("buildTimeline", () => {
  it("returns an empty timeline without stops or a fixture", () => {
    expect(buildTimeline([], stadium, null)).toEqual({
      stops: [],
      walkTotalMinutes: 0,
      spendEuros: 0,
      kickoff: null,
    });
  });

  it("schedules each stop backwards from kick-off", () => {
    const kickoffIso = "2030-08-04T20:00:00.000Z";
    const timeline = buildTimeline(spots, stadium, kickoffIso);
    const first = timeline.stops[0];
    const second = timeline.stops[1];
    const firstLeg = walkMinutes(distanceInMetres(spots[0], spots[1]));
    const secondLeg = walkMinutes(distanceInMetres(spots[1], stadium));

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(timeline.kickoff?.toISOString()).toBe(kickoffIso);
    expect(first?.dwellMinutes).toBe(DWELL_MINUTES.LOCAL_FOOD);
    expect(second?.dwellMinutes).toBe(DWELL_MINUTES.PUB);
    expect(first?.legMinutes).toBe(firstLeg);
    expect(second?.legMinutes).toBe(secondLeg);
    expect(timeline.walkTotalMinutes).toBe(firstLeg + secondLeg);
    expect(timeline.spendEuros).toBe(36);
    expect(second?.startsAt.getTime()).toBe(
      (first?.startsAt.getTime() ?? 0) +
        (first?.dwellMinutes ?? 0) * 60_000 +
        firstLeg * 60_000,
    );
    expect(
      (second?.startsAt.getTime() ?? 0) +
        ((second?.dwellMinutes ?? 0) + secondLeg) * 60_000,
    ).toBe(new Date(kickoffIso).getTime() - 20 * 60_000);
  });
});
