"use client";

import { Wallet, Receipt, AlertOctagon, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/reports/kpi-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { EmptyState } from "@/components/shared/states";

export default function FinanceDashboardPage() {
  return (
    <div>
      <Header title="Finance Dashboard" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Revenue (all events)" value="—" icon={TrendingUp} tone="success" hint="Phase 4" />
        <KPICard label="Pending settlements" value="—" icon={Wallet} tone="warning" hint="Phase 4" />
        <KPICard label="Transactions today" value="—" icon={Receipt} tone="accent" hint="Phase 4" />
        <KPICard label="Failed transactions" value="—" icon={AlertOctagon} tone="info" hint="Phase 4" />
      </div>

      <div className="mt-6">
        <GlassPanel>
          <EmptyState
            icon={Wallet}
            title="Finance Console — Transactions, Reconciliation & Refunds"
            description="This area is built out in Phase 4, on top of the events and registrations created in Phases 2–3. The dashboard shell, auth, and role separation from Operations are already live."
          />
        </GlassPanel>
      </div>
    </div>
  );
}
