import { z } from "zod";

/**
 * Standardized API Error for SANKALP-AEI.
 * Captures HTTP status codes and backend error payloads.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestConfig extends Omit<RequestInit, "method" | "body"> {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  requireAuth?: boolean;
}

/**
 * Retrieves the authentication token.
 * In a Next.js environment, this handles client-side retrieval.
 * Server-side retrieval should be handled via next/headers in Server Components.
 */
const getAuthToken = (): string | null => {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp("(^| )sankalp_auth_token=([^;]+)"));
    return match ? match[2] : null;
  }
  return null;
};

/**
 * Constructs the full URL with query parameters.
 */
const buildUrl = (
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  
  // Handle absolute vs relative endpoints
  const isAbsolute = endpoint.startsWith("http");
  const urlString = isAbsolute 
    ? endpoint 
    : `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    
  const url = new URL(urlString, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
};

/**
 * Core request function with Zod runtime validation.
 * Enforces strict typing and prevents malformed data from entering the frontend state.
 */
async function request<T>(
  method: HttpMethod,
  endpoint: string,
  schema: z.ZodType<T>,
  config: RequestConfig = {}
): Promise<T> {
  const { params, body, requireAuth = true, headers: customHeaders, ...rest } = config;

  const url = buildUrl(endpoint, params);
  const headers = new Headers(customHeaders);

  if (!headers.has("Content-Type") && body instanceof FormData === false) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  // Interceptor: Inject Authorization Token
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    ...rest,
  };

  if (body !== undefined) {
    fetchOptions.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Interceptor: Handle 401 Unauthorized globally
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sankalp:unauthorized"));
      }
      throw new ApiError(401, "Unauthorized access. Session may have expired.");
    }

    // Interceptor: Handle standard HTTP errors
    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new ApiError(
        response.status,
        response.statusText || "An error occurred during the request.",
        errorPayload
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return schema.parse(undefined);
    }

    const data = await response.json();

    // Runtime Validation: Ensure API response matches expected SANKALP types
    // CRITICAL: This ensures Brain Map laws (e.g., Beta distributions, CI widths) are respected at the boundary.
    const parsedData = schema.safeParse(data);
    if (!parsedData.success) {
      console.error("API Response Validation Failed:", parsedData.error.format());
      throw new ApiError(422, "Invalid response format from server", parsedData.error.format());
    }

    return parsedData.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error instanceof Error ? error.message : "Network error");
  }
}

/**
 * Centralized API Client Wrapper
 */
export const apiClient = {
  get: <T>(endpoint: string, schema: z.ZodType<T>, config?: Omit<RequestConfig, "body">) =>
    request<T>("GET", endpoint, schema, config),

  post: <T>(endpoint: string, schema: z.ZodType<T>, config?: RequestConfig) =>
    request<T>("POST", endpoint, schema, config),

  put: <T>(endpoint: string, schema: z.ZodType<T>, config?: RequestConfig) =>
    request<T>("PUT", endpoint, schema, config),

  patch: <T>(endpoint: string, schema: z.ZodType<T>, config?: RequestConfig) =>
    request<T>("PATCH", endpoint, schema, config),

  delete: <T>(endpoint: string, schema: z.ZodType<T>, config?: RequestConfig) =>
    request<T>("DELETE", endpoint, schema, config),
};