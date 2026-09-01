"use client";

import type { ReactNode } from "react";
import { RoleGuard } from "@/components/layout/role-guard";
import { AppShell } from "@/components/layout/app-shell";
import { canAccessFinanceConsole } from "@/lib/rbac";

export default function FinanceLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow={canAccessFinanceConsole}>
      <AppShell area="finance">{children}</AppShell>
    </RoleGuard>
  );
}
