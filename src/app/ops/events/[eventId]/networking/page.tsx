"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/shared/states";
import { useNetworking } from "@/hooks/useNetworking";
import type { ConnectionStatus } from "@/types/networking";

/** Same `useNetworking` hook, its state, and its mutation payloads as before. */
export default function NetworkingPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const {
    config,
    participants,
    connections,
    reports,
    metrics,
    saveConfig,
    updateReport,
    block,
    participantPage,
    setParticipantPage,
    participantSearch,
    setParticipantSearch,
    participantOrganization,
    setParticipantOrganization,
    participantDesignation,
    setParticipantDesignation,
    connectionPage,
    setConnectionPage,
    connectionStatus,
    setConnectionStatus,
    connectionSearch,
    setConnectionSearch,
  } = useNetworking(eventId);

  if (config.isLoading || participants.isLoading || connections.isLoading || reports.isLoading || metrics.isLoading) {
    return <p className="p-5 text-sm text-[var(--foreground-muted)]">Loading networking…</p>;
  }
  if (config.isError || participants.isError || connections.isError || reports.isError || metrics.isError) {
    return (
      <div className="p-5">
        <ErrorState title="Unable to load networking" />
      </div>
    );
  }

  const current = config.data ?? { enabled: false, matchmaking_enabled: true, allowed_participant_types: null };

  return (
    <div>
      <Link
        href={`/ops/events/${eventId}`}
        className="mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to event
      </Link>
      <Header title="Participant Networking" />
      <p className="mb-4 -mt-2 text-sm text-[var(--foreground-muted)]">Event-scoped privacy, matchmaking, connections, and reports.</p>

      {metrics.data && (
        <div className="mb-4 flex flex-wrap gap-3">
          {Object.entries(metrics.data).map(([key, value]) => (
            <GlassPanel key={key} padded={false} className="min-w-[120px] p-3.5">
              <p className="text-xs uppercase tracking-wide text-[var(--foreground-subtle)]">{key.replaceAll("_", " ")}</p>
              <p className="mt-0.5 text-xl font-semibold text-[var(--foreground)]">{value}</p>
            </GlassPanel>
          ))}
        </div>
      )}

      <GlassPanel className="mb-4">
        <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Configuration</h2>
        <div className="flex flex-wrap gap-6">
          <Switch
            checked={current.enabled}
            onChange={(checked) => saveConfig.mutate({ ...current, enabled: checked })}
            label="Enable networking"
          />
          <Switch
            checked={current.matchmaking_enabled}
            onChange={(checked) => saveConfig.mutate({ ...current, matchmaking_enabled: checked })}
            label="Enable matchmaking"
          />
        </div>
      </GlassPanel>

      <GlassPanel className="mb-4">
        <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Discoverable participants</h2>
        <div className="mb-3.5 flex flex-wrap gap-2">
          <Input
            className="max-w-xs"
            value={participantSearch}
            onChange={(e) => {
              setParticipantSearch(e.target.value);
              setParticipantPage(1);
            }}
            placeholder="Search participants"
          />
          <Input
            className="max-w-[200px]"
            value={participantOrganization}
            onChange={(e) => {
              setParticipantOrganization(e.target.value);
              setParticipantPage(1);
            }}
            placeholder="Organization"
          />
          <Input
            className="max-w-[200px]"
            value={participantDesignation}
            onChange={(e) => {
              setParticipantDesignation(e.target.value);
              setParticipantPage(1);
            }}
            placeholder="Designation"
          />
        </div>
        {participants.data?.items.length ? (
          <div className="space-y-2">
            {participants.data.items.map((person) => (
              <div key={person.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
                <p className="text-sm font-medium text-[var(--foreground)]">{person.display_name ?? "Unnamed participant"}</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {person.organization ?? ""} {person.designation ? `· ${person.designation}` : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--foreground-muted)]">No opted-in participants.</p>
        )}
        <Pagination
          page={participantPage}
          totalPages={Math.max(1, Math.ceil((participants.data?.total ?? 0) / 25))}
          totalItems={participants.data?.total}
          onPageChange={setParticipantPage}
        />
      </GlassPanel>

      <GlassPanel className="mb-4">
        <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Connections</h2>
        <div className="mb-3.5 flex flex-wrap gap-2">
          <Input
            className="max-w-xs"
            value={connectionSearch}
            onChange={(e) => {
              setConnectionSearch(e.target.value);
              setConnectionPage(1);
            }}
            placeholder="Search participant"
          />
          <Select
            className="w-44"
            value={connectionStatus ?? ""}
            onChange={(e) => {
              setConnectionStatus(e.target.value ? (e.target.value as ConnectionStatus) : undefined);
              setConnectionPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="blocked">Blocked</option>
          </Select>
        </div>
        {connections.data?.items.length ? (
          <div className="space-y-2">
            {connections.data.items.map((connection) => (
              <div key={connection.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
                <Badge tone="neutral" className="capitalize">{connection.status}</Badge>
                <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">Intent: {connection.intent}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--foreground-muted)]">No connections found.</p>
        )}
        <Pagination
          page={connectionPage}
          totalPages={Math.max(1, Math.ceil((connections.data?.total ?? 0) / 25))}
          totalItems={connections.data?.total}
          onPageChange={setConnectionPage}
        />
      </GlassPanel>

      <GlassPanel>
        <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Reports</h2>
        {reports.data?.items.length ? (
          <div className="space-y-2">
            {reports.data.items.map((report) => (
              <div key={report.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
                <div>
                  <p className="text-sm text-[var(--foreground)]">{report.reason}</p>
                  <Badge tone="neutral" className="mt-1 capitalize">{report.status}</Badge>
                </div>
                <div className="flex gap-2">
                  {report.status === "open" && (
                    <Button size="sm" variant="outline" onClick={() => updateReport.mutate({ id: report.id, status: "reviewed" })}>
                      Mark reviewed
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => block.mutate(report.reported_user_id)}>
                    Block participant
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--foreground-muted)]">No reports.</p>
        )}
      </GlassPanel>
    </div>
  );
}