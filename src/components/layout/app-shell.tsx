import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({
  area,
  children,
}: {
  area: "ops" | "finance";
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full gap-4 p-4">
      <Sidebar area={area} />
      <main className="min-w-0 flex-1 pb-10">{children}</main>
    </div>
  );
}
