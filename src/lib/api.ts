export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * fetch + JSON parse that fails loudly on non-2xx responses, instead of
 * trying to parse an HTML/text error page as JSON.
 */
export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new ApiError(res.status, `Request to ${input} failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

/** Base URL of the backend, for server-side fetches (the browser goes through the /api rewrite). */
export function getServerApiUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:80").replace(/\/$/, "");
}

/** Where to send the user back after Discord login. */
export function startLogin() {
  localStorage.setItem("redirect_target", window.location.pathname + window.location.search);
  window.location.href = "/api/auth/login";
}

/** Use as `.then(parseJson)` after fetch(): throws on non-2xx instead of parsing an error page. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- call sites predate typed responses
export async function parseJson<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new ApiError(res.status, `Request to ${res.url} failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}
