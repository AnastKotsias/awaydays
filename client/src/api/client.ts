const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/** A request that reached the server but came back with an error status. */
export class ApiError extends Error {
  // Declared and assigned separately rather than as a constructor parameter
  // property: the client compiles with `erasableSyntaxOnly`, which only allows
  // TypeScript syntax that disappears by deleting it.
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Values a query string can carry. `undefined` entries are left out. */
export type QueryParams = Record<
  string,
  string | number | boolean | undefined
>;

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(path, API_URL);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

/**
 * Performs a GET request and returns the parsed JSON body.
 *
 * `fetch` only rejects when the network itself fails — a 404 or 500 resolves
 * normally with `ok: false`. This wrapper turns those into a thrown ApiError
 * carrying the server's message, which is what TanStack Query expects and
 * what lets components render a real explanation instead of "something went
 * wrong".
 */
export async function apiGet<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, params), {
      headers: { Accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch {
    throw new ApiError(
      0,
      `Could not reach the API at ${API_URL}. Is the server running?`,
    );
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return body as T;
}
