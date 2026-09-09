"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, Copy, FileStack, Search, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useEvents } from "@/hooks/useEvents";
import { useArchiveEventTemplate, useCreateEventFromTemplate, useCreateEventTemplate, useDeleteEventTemplate, useEventTemplates } from "@/hooks/useEventTemplates";

const PAGE_SIZE = 25;

/** Same hooks and mutation payloads as before (create template, create event from template, archive, delete). */
export default function EventTemplatesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const sourceFromUrl = params.get("source_event_id") ?? "";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sourceEventId, setSourceEventId] = useState(sourceFromUrl);
  const [templateName, setTemplateName] = useState("");
  const [newEvent, setNewEvent] = useState({ name: "", start_date: "", end_date: "" });
  const { data, isLoading, isError, refetch } = useEventTemplates(page, search);
  const { data: events } = useEvents();
  const createTemplate = useCreateEventTemplate();
  const createEvent = useCreateEventFromTemplate();
  const archive = useArchiveEventTemplate();
  const remove = useDeleteEventTemplate();

  async function handleCreateTemplate() {
    if (!templateName || !sourceEventId) return;
    await createTemplate.mutateAsync({ name: templateName, source_event_id: sourceEventId });
    setTemplateName("");
  }

  async function handleCreateEvent(templateId: string) {
    if (!newEvent.name || !newEvent.start_date || !newEvent.end_date) return;
    const created = await createEvent.mutateAsync({
      templateId,
      payload: {
        name: newEvent.name,
        start_date: new Date(newEvent.start_date).toISOString(),
        end_date: new Date(newEvent.end_date).toISOString(),
      },
    });
    router.push(`/ops/events/${created.id}`);
  }

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div>
      <Header title="Event Templates" />

      <GlassPanel className="mb-4">
        <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">Create reusable template</p>
        <div className="flex flex-wrap gap-2">
          <Input className="max-w-xs" placeholder="Template name" value={templateName} onChange={(event) => setTemplateName(event.target.value)} />
          <Select className="w-56" value={sourceEventId} onChange={(event) => setSourceEventId(event.target.value)}>
            <option value="">Source event</option>
            {(events ?? []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>
          <Button onClick={handleCreateTemplate} loading={createTemplate.isPending} disabled={!templateName || !sourceEventId}>
            Create template
          </Button>
        </div>
        <p className="mt-3 text-xs text-[var(--foreground-subtle)]">
          Only reusable configuration is captured. Registrations, payments, tickets, attendance, check-ins, feedback,
          incidents, notifications, sponsors, and audit history are never copied.
        </p>
      </GlassPanel>

      <GlassPanel padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Templates</h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <Input
              className="pl-9"
              placeholder="Search templates"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        {isLoading ? (
          <div className="p-5 text-sm text-[var(--foreground-muted)]">Loading templates…</div>
        ) : isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : !data?.items.length ? (
          <div className="p-5">
            <EmptyState icon={FileStack} title="No templates" description="Create a template from an accessible event." />
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {data.items.map((template) => (
              <div key={template.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{template.name}</p>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                      {template.description || "Reusable event configuration"}
                      {template.is_archived ? " · Archived" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!template.is_archived && (
                      <Button size="sm" variant="outline" onClick={() => archive.mutate(template.id)}>
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                      </Button>
                    )}
                    {template.is_archived && (
                      <Button size="sm" variant="ghost" onClick={() => remove.mutate(template.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-[var(--danger)]" />
                      </Button>
                    )}
                  </div>
                </div>
                {!template.is_archived && (
                  <div className="mt-3.5 flex flex-wrap items-end gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-muted)] p-3">
                    <Copy className="mb-2 h-4 w-4 text-[var(--foreground-muted)]" />
                    <Input
                      placeholder="New event name"
                      value={newEvent.name}
                      onChange={(event) => setNewEvent((value) => ({ ...value, name: event.target.value }))}
                    />
                    <Input
                      type="datetime-local"
                      value={newEvent.start_date}
                      onChange={(event) => setNewEvent((value) => ({ ...value, start_date: event.target.value }))}
                    />
                    <Input
                      type="datetime-local"
                      value={newEvent.end_date}
                      onChange={(event) => setNewEvent((value) => ({ ...value, end_date: event.target.value }))}
                    />
                    <Button size="sm" onClick={() => handleCreateEvent(template.id)} loading={createEvent.isPending}>
                      Create event
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} totalItems={data?.total} onPageChange={setPage} />
      </GlassPanel>
    </div>
  );
}