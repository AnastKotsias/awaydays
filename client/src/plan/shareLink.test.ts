import { describe, expect, it } from "vitest";
import { decodePlan, encodePlan, type SharePayload } from "@/plan/shareLink";

const payload: SharePayload = {
  v: 1,
  s: "oaka",
  e: "event-123",
  p: ["spot-1", "spot-2"],
};

describe("share links", () => {
  it("round-trips a plan through a URL-safe token", () => {
    const token = encodePlan(payload);

    expect(token).not.toMatch(/[+/=]/);
    expect(decodePlan(token)).toEqual(payload);
  });

  it("rejects malformed, unsupported, and incomplete payloads", () => {
    expect(decodePlan("not-a-token")).toBeNull();
    expect(
      decodePlan(
        encodePlan({ ...payload, v: 1 }).replace(/^./, "x"),
      ),
    ).toBeNull();
    expect(decodePlan(btoa(JSON.stringify({ v: 1, s: "oaka" })))).toBeNull();
  });
});
