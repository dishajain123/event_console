/**
 * Typed access to environment variables. Nothing in the app should
 * read from `process.env` directly outside this file — this is the
 * one place that knows the API base URL comes from an env var, so
 * pointing the console at a different backend (staging, local, prod)
 * is a single value to change, not a search-and-replace.
 */
export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001/api/v1",
} as const;
