"use client";

import type { ReactNode } from "react";
import { RoleGuard } from "@/components/layout/role-guard";
import { AppShell } from "@/components/layout/app-shell";
import { canAccessOpsConsole } from "@/lib/rbac";

export default function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow={canAccessOpsConsole}>
      <AppShell area="ops">{children}</AppShell>
    </RoleGuard>
  );
}
