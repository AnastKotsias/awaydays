import { describe, expect, it } from "vitest";
import { distanceInMetres } from "@/lib/geo";

const origin = { latitude: 38.0366, longitude: 23.7873 };

describe("geo calculations", () => {
  it("returns zero distance for the same coordinate and is symmetrical", () => {
    const destination = { latitude: 38.0402, longitude: 23.7845 };

    expect(distanceInMetres(origin, origin)).toBeCloseTo(0, 8);
    expect(distanceInMetres(origin, destination)).toBeCloseTo(
      distanceInMetres(destination, origin),
      8,
    );
  });
});
