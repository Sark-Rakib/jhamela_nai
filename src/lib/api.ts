/**
 * Typed API client for the Jhamela Nai Express backend.
 *
 * Design notes:
 *  - Auth uses HTTP-only cookies set by the API, so `credentials: "include"` is
 *    mandatory on every mutating call.
 *  - The backend always answers with `{ success, data, message }` — errors are
 *    normalised into `ApiError` so the UI never has to inspect the transport.
 *  - When the API is unreachable we surface `status: 0` and a friendly Bangla
 *    message. Callers decide whether to degrade to guest/local mode.
 */

import { API_URL } from "@/lib/site";

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  meta?: Record<string, unknown>;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: Record<string, string[]>;

  constructor(message: string, status: number, code?: string, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isOffline() {
    return this.status === 0;
  }
  get isAuthError() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
}

const FRIENDLY_FALLBACK =
  "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।";

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** Skip the JSON parse for 204 responses. */
  expectEmpty?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal, expectEmpty } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
      cache: "no-store",
    });
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new ApiError(
      "সার্ভারে পৌঁছানো যায়নি। আপনার ইন্টারনেট সংযোগ দেখুন।",
      0,
      "NETWORK_ERROR",
    );
  }

  if (response.status === 204 || expectEmpty) {
    if (!response.ok) throw new ApiError(await safeMessage(response), response.status);
    return undefined as T;
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message || FRIENDLY_FALLBACK,
      response.status,
      payload?.code as string | undefined,
    );
  }

  return (payload?.data ?? (payload as unknown)) as T;
}

async function safeMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiEnvelope<unknown>;
    return payload?.message || FRIENDLY_FALLBACK;
  } catch {
    return FRIENDLY_FALLBACK;
  }
}

export const api = {
  get: <T,>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T,>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T,>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T,>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T,>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

/** Normalises any thrown value into a Bangla, user-facing message. */
export function friendlyError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.name === "AbortError") return "";
  if (error instanceof Error && error.message) return error.message;
  return FRIENDLY_FALLBACK;
}

export function isApiUnavailable(error: unknown): boolean {
  return error instanceof ApiError && (error.isOffline || error.status >= 502);
}
