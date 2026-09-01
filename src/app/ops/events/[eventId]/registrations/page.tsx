"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { RegistrationStatusBadge } from "@/components/registrations/registration-status-badge";
import { RegistrationDetailDrawer } from "@/components/registrations/registration-detail-drawer";
import { useEvent } from "@/hooks/useEvents";
import { useEventRegistrations } from "@/hooks/useRegistrations";
import { REGISTRATION_STATUS_LABELS, type RegistrationOut, type RegistrationStatus } from "@/types/registrations";

export default function RegistrationsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const { data: registrations, isLoading, isError, refetch } = useEventRegistrations(eventId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selected, setSelected] = useState<RegistrationOut | null>(null);

  const participationTypes = useMemo(
    () => Array.from(new Set((registrations ?? []).map((r) => r.participation_type))),
    [registrations],
  );

  const filtered = useMemo(() => {
    if (!registrations) return [];
    return registrations.filter((r) => {
      const matchesSearch =
        !search || r.participants.some((p) => p.full_name.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesType = typeFilter === "all" || r.participation_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [registrations, search, statusFilter, typeFilter]);

  const pendingCount = (registrations ?? []).filter(
    (r) => r.status === "submitted" || r.status === "pending_verification",
  ).length;

  return (
    <div>
      <Link
        href={`/ops/events/${eventId}`}
        className="fade-in mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {event?.name ?? "Back to event"}
      </Link>

      <Header title="Registrations" />

      {pendingCount > 0 && (
        <div className="fade-in mb-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--warning-soft)] px-4 py-2.5 text-sm text-[var(--warning)]">
          <ClipboardList className="h-4 w-4" />
          <span className="font-medium">{pendingCount}</span> registration{pendingCount !== 1 && "s"} waiting
          for a decision
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
          <Input
            placeholder="Search by participant name…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          className="w-56"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | "all")}
        >
          <option value="all">All statuses</option>
          {Object.entries(REGISTRATION_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        {participationTypes.length > 1 && (
          <Select className="w-44" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All types</option>
            {participationTypes.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type}
              </option>
            ))}
          </Select>
        )}
      </div>

      <GlassPanel padded={false}>
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={4} />
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ClipboardList}
              title={registrations && registrations.length > 0 ? "No registrations match your filters" : "No registrations yet"}
              description={
                registrations && registrations.length > 0
                  ? "Try a different search term or filter."
                  : "Registrations will appear here once participants start signing up."
              }
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                <th className="px-6 py-3 font-medium">Participant</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Submitted</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filtered.map((registration) => (
                <tr
                  key={registration.id}
                  onClick={() => setSelected(registration)}
                  className="cursor-pointer transition-colors hover:bg-black/[0.02]"
                >
                  <td className="px-6 py-4 font-medium text-[var(--foreground)]">
                    {registration.participants[0]?.full_name ?? "—"}
                    {registration.participants.length > 1 && (
                      <span className="ml-1.5 text-xs font-normal text-[var(--foreground-muted)]">
                        +{registration.participants.length - 1} more
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize text-[var(--foreground-muted)]">
                    {registration.participation_type}
                  </td>
                  <td className="px-6 py-4 text-[var(--foreground-muted)]">
                    {registration.submitted_at
                      ? new Date(registration.submitted_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <RegistrationStatusBadge status={registration.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassPanel>

      {selected && (
        <RegistrationDetailDrawer eventId={eventId} registration={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
