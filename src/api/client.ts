import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { useSessionStore } from "@/state/sessionStore";

/**
 * The one place every backend call passes through. Nothing else in the
 * app should import axios directly — this is what makes "the console
 * never decides permissions itself, it mirrors backend responses"
 * actually true: every error from the backend (403, 422, etc.) flows
 * through the same normalization path in api/*.ts callers.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useSessionStore.getState().accessToken;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  // Coalesces concurrent 401s into a single refresh call rather than
  // firing one refresh request per failed request.
  if (!refreshPromise) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 8000);

    refreshPromise = fetch("/api/auth/refresh", { method: "POST", signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { access_token: string };
        return data.access_token;
      })
      .catch(() => null)
      .finally(() => {
        window.clearTimeout(timeoutId);
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        useSessionStore.getState().setAccessToken(newToken);
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(originalRequest);
      }
      useSessionStore.getState().clearSession();
    }

    return Promise.reject(normalizeApiError(error));
  },
);

/** Every backend AppError responds with {error_code, message} — this is
 * the one shape every screen's error state renders from. */
export interface ApiError {
  status: number;
  errorCode: string;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeApiError(error: any): ApiError {
  const status = error?.response?.status ?? 0;
  const body = error?.response?.data;
  return {
    status,
    errorCode: body?.error_code ?? "unknown_error",
    message: body?.message ?? error?.message ?? "Something went wrong. Please try again.",
  };
}
