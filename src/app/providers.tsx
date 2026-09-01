"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/shared/toaster";

export function Providers({ children }: { children: ReactNode }) {
  // useState (not a module-level singleton) so each request/session on
  // the server gets its own client, while the client keeps one across
  // the whole browser session — the standard Next.js App Router pattern.
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
