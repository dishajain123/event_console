"use client";

import Link from "next/link";
import { Wallet, Receipt, AlertOctagon, RotateCcw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/reports/kpi-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { usePayments, useRefunds } from "@/hooks/usePayments";

/**
 * Same two hooks (`usePayments`, `useRefunds`) the Transactions and
 * Refunds pages already use — no new endpoints. Each card requests
 * `pageSize: 1` purely to keep the payload small; the count itself is
 * the backend's real, authoritative `total` for that filter, not a
 * client-side count of whatever page happened to load. There's no
 * summary/aggregate endpoint for a true "revenue collected" figure
 * (that would mean summing amounts across every page), so this
 * dashboard sticks to counts the backend already computes rather than
 * fabricating one.
 */
export default function FinanceDashboardPage() {
  const allPayments = usePayments({ pageSize: 1 });
  const failedPayments = usePayments({ pageSize: 1, status: "failed" });
  const allRefunds = useRefunds({ pageSize: 1 });
  const pendingRefunds = useRefunds({ pageSize: 1, status: "pending_admin_approval" });

  return (
    <div>
      <Header title="Finance Dashboard" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total transactions"
          value={allPayments.data?.total ?? "—"}
          icon={Receipt}
          tone="accent"
        />
        <KPICard
          label="Failed transactions"
          value={failedPayments.data?.total ?? "—"}
          icon={AlertOctagon}
          tone="warning"
        />
        <KPICard
          label="Refund requests"
          value={allRefunds.data?.total ?? "—"}
          icon={RotateCcw}
          tone="info"
        />
        <KPICard
          label="Pending approval"
          value={pendingRefunds.data?.total ?? "—"}
          icon={Wallet}
          tone="warning"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassPanel>
          <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Transactions</h2>
          <p className="mb-3.5 text-sm text-[var(--foreground-muted)]">
            Review payments across accessible events, filter by status, and drill into any transaction.
          </p>
          <Link href="/finance/transactions">
            <Button variant="outline" size="sm">Open transactions</Button>
          </Link>
        </GlassPanel>
        <GlassPanel>
          <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Refunds</h2>
          <p className="mb-3.5 text-sm text-[var(--foreground-muted)]">
            Approve or track refund requests awaiting a decision.
          </p>
          <Link href="/finance/refunds">
            <Button variant="outline" size="sm">Open refunds</Button>
          </Link>
        </GlassPanel>
      </div>
    </div>
  );
}