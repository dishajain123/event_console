"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserRoundCheck } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useEvents } from "@/hooks/useEvents";
import { useActivateVolunteer, useVolunteerApplications, useVolunteerStatusMutation } from "@/hooks/useVolunteers";
import type { VolunteerApplicationStatus, VolunteerApplicationType } from "@/types/volunteers";

export default function VolunteersPage() {
  const { data: events } = useEvents();
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState<VolunteerApplicationStatus | "">("");
  const [applicationType, setApplicationType] = useState<VolunteerApplicationType | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const applications = useVolunteerApplications({ event_id: eventId || undefined, status: status || undefined, search: search || undefined, application_type: applicationType || undefined, page, page_size: 25 });
  const updateStatus = useVolunteerStatusMutation();
  const activate = useActivateVolunteer();

  async function changeStatus(id: string, next: VolunteerApplicationStatus) {
    try { await updateStatus.mutateAsync({ id, status: next }); toast.success("Application updated"); }
    catch (error) { toast.error("Could not update application", { description: (error as { message?: string }).message }); }
  }

  async function activateApplication(id: string) {
    try { await activate.mutateAsync(id); toast.success("Volunteer activated for this event"); }
    catch (error) { toast.error("Could not activate volunteer", { description: (error as { message?: string }).message }); }
  }

  return (
    <div>
      <Header title="Volunteer Applications" />
      <GlassPanel className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Select className="w-64" value={eventId} onChange={(event) => setEventId(event.target.value)}>
            <option value="">All assigned events</option>
            {(events ?? []).map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
          </Select>
          <Select className="w-44" value={status} onChange={(event) => setStatus(event.target.value as VolunteerApplicationStatus | "")}>
            <option value="">All statuses</option><option value="submitted">Submitted</option><option value="under_review">Under review</option><option value="contacted">Contacted</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
          </Select>
          <Select className="w-44" value={applicationType} onChange={(event) => setApplicationType(event.target.value as VolunteerApplicationType | "")}>
            <option value="">All application types</option><option value="volunteer">Volunteer</option><option value="event_manager">Event Manager</option>
          </Select>
          <Input className="max-w-xs" placeholder="Search applicant, phone, skill" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </GlassPanel>
      <GlassPanel padded={false}>
        {applications.isLoading ? <div className="p-6">Loading applications…</div> : applications.isError ? <div className="p-6"><ErrorState onRetry={() => applications.refetch()} /></div> : !applications.data?.length ? <div className="p-6"><EmptyState icon={UserRoundCheck} title="No volunteer applications" /></div> : (
          <div className="divide-y divide-black/[0.05]">
            {applications.data.map((item) => (
              <div key={item.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{item.full_name} <Badge tone="accent" className="ml-2 capitalize">{item.application_type.replace("_", " ")}</Badge></p>
                    <p className="text-sm text-[var(--foreground-muted)]">{item.phone}{item.email ? ` · ${item.email}` : ""}</p>
                    <p className="mt-1 text-xs text-[var(--foreground-muted)]">Event: {item.event_id}</p>
                    {item.skills_experience && <p className="mt-2 text-sm">{item.skills_experience}</p>}
                    {item.availability && <p className="text-xs text-[var(--foreground-muted)]">Availability: {item.availability}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral" className="capitalize">{item.status.replace("_", " ")}</Badge>
                    {item.status !== "approved" && item.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => changeStatus(item.id, "approved")}>Approve</Button>}
                    {item.status !== "rejected" && item.status !== "approved" && <Button size="sm" variant="ghost" onClick={() => changeStatus(item.id, "rejected")}>Reject</Button>}
                    {item.status === "approved" && !item.activated_staff_assignment_id && <Button size="sm" onClick={() => activateApplication(item.id)}>Activate volunteer</Button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-black/[0.06] px-6 py-3 text-xs text-[var(--foreground-muted)]"><span>Page {page}</span><div className="flex gap-2"><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={!applications.data || applications.data.length < 25} onClick={() => setPage((value) => value + 1)}>Next</button></div></div>
      </GlassPanel>
    </div>
  );
}
