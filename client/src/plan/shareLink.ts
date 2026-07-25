/**
 * Share links.
 *
 * Phase 3 will store itineraries server-side and hand out a short id. Until
 * that endpoint exists, the whole plan is encoded into the URL itself, so a
 * shared link genuinely opens on someone else's phone instead of only working
 * in the browser that made it.
 *
 * The trade-off is length — a few UUIDs make for a long URL — and that the
 * link cannot be revoked. Both go away when `Itinerary.shareId` takes over.
 */

export type SharePayload = {
  /** Version, so an old link can be rejected rather than misread. */
  v: 1;
  /** Stadium slug. */
  s: string;
  /** Event id the timeline counts back from, if one was chosen. */
  e: string | null;
  /** Spot ids, in visiting order. */
  p: string[];
};

/** base64 -> base64url: URL-safe characters, no padding. */
function toUrlSafe(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(token: string): string {
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
  // atob wants the padding back.
  return base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
}

export function encodePlan(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  // btoa only handles Latin-1, so encode to UTF-8 bytes first. Everything in
  // a payload is ASCII today, but ids are not something to make assumptions
  // about.
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return toUrlSafe(btoa(binary));
}

export function decodePlan(token: string): SharePayload | null {
  try {
    const binary = atob(fromUrlSafe(token));
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));

    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as SharePayload).v === 1 &&
      typeof (parsed as SharePayload).s === "string" &&
      Array.isArray((parsed as SharePayload).p)
    ) {
      return parsed as SharePayload;
    }
  } catch {
    // Truncated or hand-edited link.
  }
  return null;
}
