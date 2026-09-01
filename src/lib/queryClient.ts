import { QueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/api/client";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          const apiError = error as unknown as ApiError;
          // Never retry auth/permission failures — retrying a 401/403
          // just burns time before the same, correct rejection.
          if (apiError?.status === 401 || apiError?.status === 403) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
