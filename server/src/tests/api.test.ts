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

async function requestJson(
  path: string,
  method: "POST" | "PATCH",
  body: unknown,
) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const parsed: unknown = await response.json();
  return { response, body: parsed };
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

  describe("itinerary API", () => {
    it("creates, reads, updates, and deletes a public itinerary", async () => {
      const eventsResult = await getJson("/api/events?limit=1");
      const event = (
        eventsResult.body as {
          data: Array<{ id: string; stadium?: { slug: string } }>;
        }
      ).data[0];
      assert.ok(event?.id);
      assert.ok(event.stadium?.slug);

      const spotsResult = await getJson(
        `/api/stadiums/${event.stadium.slug}/spots?radius=20000&limit=2`,
      );
      const spots = (spotsResult.body as { data: Array<{ id: string }> }).data;
      assert.ok(spots.length >= 2);
      const firstSpot = spots[0];
      const secondSpot = spots[1];
      assert.ok(firstSpot?.id);
      assert.ok(secondSpot?.id);

      const created = await requestJson("/api/itineraries", "POST", {
        eventId: event.id,
        spotIds: [firstSpot.id, secondSpot.id],
        title: "Test away day",
      });
      assert.equal(created.response.status, 201);

      const createdData = (
        created.body as {
          data: {
            shareId: string;
            title: string;
            items: Array<{ visitOrder: number }>;
          };
        }
      ).data;
      assert.equal(createdData.title, "Test away day");
      assert.deepEqual(
        createdData.items.map((item) => item.visitOrder),
        [1, 2],
      );

      const read = await getJson(`/api/itineraries/${createdData.shareId}`);
      assert.equal(read.response.status, 200);
      assert.equal(
        (read.body as { data: { shareId: string } }).data.shareId,
        createdData.shareId,
      );

      const updated = await requestJson(
        `/api/itineraries/${createdData.shareId}`,
        "PATCH",
        { title: "Updated away day", spotIds: [secondSpot.id] },
      );
      assert.equal(updated.response.status, 200);
      const updatedData = (
        updated.body as {
          data: { title: string; items: Array<{ visitOrder: number }> };
        }
      ).data;
      assert.equal(updatedData.title, "Updated away day");
      assert.deepEqual(
        updatedData.items.map((item) => item.visitOrder),
        [1],
      );

      const deleted = await fetch(`${baseUrl}/api/itineraries/${createdData.shareId}`, {
        method: "DELETE",
      });
      assert.equal(deleted.status, 204);

      const afterDelete = await getJson(
        `/api/itineraries/${createdData.shareId}`,
      );
      assert.equal(afterDelete.response.status, 404);
    });

    it("rejects duplicate and cross-stadium spots", async () => {
      const eventsResult = await getJson("/api/events?limit=1");
      const event = (
        eventsResult.body as {
          data: Array<{ id: string; stadium?: { slug: string } }>;
        }
      ).data[0];
      assert.ok(event?.id);
      assert.ok(event.stadium?.slug);

      const sameStadium = await getJson(
        `/api/stadiums/${event.stadium.slug}/spots?radius=20000&limit=1`,
      );
      const sameStadiumSpot = (
        sameStadium.body as { data: Array<{ id: string }> }
      ).data[0];
      assert.ok(sameStadiumSpot?.id);

      const duplicate = await requestJson("/api/itineraries", "POST", {
        eventId: event.id,
        spotIds: [sameStadiumSpot.id, sameStadiumSpot.id],
      });
      assert.equal(duplicate.response.status, 400);

      const otherStadium = await getJson("/api/stadiums/oaka/spots?limit=1");
      const otherSpot = (
        otherStadium.body as { data: Array<{ id: string }> }
      ).data[0];
      assert.ok(otherSpot?.id);

      const crossStadium = await requestJson("/api/itineraries", "POST", {
        eventId: event.id,
        spotIds: [otherSpot.id],
      });
      assert.equal(crossStadium.response.status, 400);
    });

    it("rejects malformed share ids and missing itineraries", async () => {
      const malformed = await getJson("/api/itineraries/not-a-uuid");
      assert.equal(malformed.response.status, 400);

      const missing = await getJson(
        "/api/itineraries/00000000-0000-0000-0000-000000000000",
      );
      assert.equal(missing.response.status, 404);
    });
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
