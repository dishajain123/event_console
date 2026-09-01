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
    <div className="mx-auto flex max-w-[1600px] gap-4 p-4">
      <Sidebar area={area} />
      <main className="min-w-0 flex-1 pb-10">{children}</main>
    </div>
  );
}
