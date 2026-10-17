import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import { createApp } from "../app.js";
import { disconnectDb } from "../db.js";
import {
  boundingBox,
  distanceInMetres,
  offsetCoordinates,
} from "../lib/geo.js";

const app = createApp();
let baseUrl: string;
let server: ReturnType<typeof app.listen>;

async function getJson(path: string) {
  const response = await fetch(`${baseUrl}${path}`);
  const body: unknown = await response.json();
  return { response, body };
}

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => {
    server.once("listening", resolve);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await disconnectDb();
});

describe("stadium API", () => {
  it("filters stadiums by city and returns their counts", async () => {
    const { response, body } = await getJson("/api/stadiums?city=Piraeus");

    assert.equal(response.status, 200);
    assert.ok(body && typeof body === "object" && "data" in body);
    const data = (body as { data: Array<{ city: string; slug: string }> }).data;
    assert.ok(data.length > 0);
    assert.ok(data.every((stadium) => stadium.city === "Piraeus"));
    assert.ok(data.some((stadium) => stadium.slug === "karaiskakis"));
  });

  describe("geo calculations", () => {
    const origin = { latitude: 38.0366, longitude: 23.7873 };

    it("places an offset coordinate inside the radius bounding box", () => {
      const radius = 2_000;
      const destination = offsetCoordinates(origin, 1_200, -800);
      const box = boundingBox(origin, radius);

      assert.ok(destination.latitude >= box.minLatitude);
      assert.ok(destination.latitude <= box.maxLatitude);
      assert.ok(destination.longitude >= box.minLongitude);
      assert.ok(destination.longitude <= box.maxLongitude);
      assert.ok(distanceInMetres(origin, destination) < radius);
    });

    it("uses a rectangle as a candidate filter without treating its corners as in-radius", () => {
      const radius = 2_000;
      const box = boundingBox(origin, radius);
      const corner = {
        latitude: box.maxLatitude,
        longitude: box.maxLongitude,
      };

      assert.ok(distanceInMetres(origin, corner) > radius);
    });
  });

  it("filters events by sport and stadium", async () => {
    const { response, body } = await getJson(
      "/api/events?sport=BASKETBALL&stadium=sef",
    );

    assert.equal(response.status, 200);
    const data = (body as { data: Array<{ sport: string; stadium?: { slug: string } }> }).data;
    assert.ok(data.length > 0);
    assert.ok(data.every((event) => event.sport === "BASKETBALL"));
    assert.ok(data.every((event) => event.stadium?.slug === "sef"));
  });

  it("rejects invalid query parameters with field details", async () => {
    const { response, body } = await getJson("/api/events?limit=0");

    assert.equal(response.status, 400);
    assert.deepEqual(body, {
      error: "Invalid request",
      details: [
        {
          field: "limit",
          message: "Too small: expected number to be >=1",
        },
      ],
    });
  });

  it("returns 404 for an unknown stadium", async () => {
    const { response, body } = await getJson("/api/stadiums/not-a-real-ground");

    assert.equal(response.status, 404);
    assert.deepEqual(body, {
      error: 'No stadium with slug "not-a-real-ground"',
    });
  });

  it("returns 400 for an invalid event id", async () => {
    const { response, body } = await getJson("/api/events/not-an-uuid");

    assert.equal(response.status, 400);
    assert.deepEqual(body, {
      error: "Invalid request",
      details: [
        {
          field: "id",
          message: "Not a valid event id",
        },
      ],
    });
  });
});
