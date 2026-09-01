"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      gap={10}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "glass-panel-strong flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3.5 w-full text-sm shadow-lg",
          title: "font-medium text-[var(--foreground)]",
          description: "text-[var(--foreground-muted)] text-xs mt-0.5",
          success: "!border-l-4 !border-l-[var(--success)]",
          error: "!border-l-4 !border-l-[var(--danger)]",
          warning: "!border-l-4 !border-l-[var(--warning)]",
          info: "!border-l-4 !border-l-[var(--info)]",
        },
      }}
    />
  );
}
