"use client";

import { use, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccess, useAccessTransfers, useCancelAccessTransfer, useCreateAccessZone, useReassignAccessTicket, useRevokeAccessTicket, useUpsertAccessPolicy } from "@/hooks/useAccess";

export default function AccessPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { policies, zones, tickets } = useAccess(eventId);
  const [transferPage, setTransferPage] = useState(1);
  const [transferSearch, setTransferSearch] = useState("");
  const [transferStatus, setTransferStatus] = useState("pending");
  const transfers = useAccessTransfers(eventId, { page: transferPage, search: transferSearch, status: transferStatus || undefined });
  const cancelTransfer = useCancelAccessTransfer(eventId);
  const revoke = useRevokeAccessTicket(eventId);
  const reassign = useReassignAccessTicket(eventId);
  const createZone = useCreateAccessZone(eventId);
  const savePolicy = useUpsertAccessPolicy(eventId);
  const [zoneCode, setZoneCode] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [accessType, setAccessType] = useState("general");
  const [reentry, setReentry] = useState(false);
  const [validDates, setValidDates] = useState("");
  const error = policies.isError || zones.isError || tickets.isError;
  const dates = validDates.split(",").map((value) => value.trim()).filter(Boolean);

  return <div className="space-y-6">
    <Header title="Ticket Access Management" />
    <p className="-mt-4 text-sm text-[var(--foreground-muted)]">Event-scoped pass policies, validity, zones, and ticket ownership.</p>
    {error || transfers.isError ? <ErrorState title="Unable to load access configuration" /> : <>
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel>
          <h2 className="mb-3 text-sm font-semibold">Access policies</h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <Input className="max-w-32" placeholder="Type" value={accessType} onChange={(event) => setAccessType(event.target.value)} />
            <Input className="min-w-60" placeholder="Valid dates, YYYY-MM-DD" value={validDates} onChange={(event) => setValidDates(event.target.value)} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={reentry} onChange={(event) => setReentry(event.target.checked)} /> Re-entry</label>
            <Button size="sm" onClick={() => savePolicy.mutate({ access_type: accessType, allows_reentry: reentry, max_entries: reentry ? 2 : 1, valid_dates: dates })}>Save policy</Button>
          </div>
          {policies.isLoading ? <p>Loading...</p> : policies.data?.length ? <div className="space-y-2">{policies.data.map((policy) => <div key={policy.id} className="rounded border p-3 text-sm"><div className="flex justify-between"><span className="font-medium uppercase">{policy.access_type}</span><span>{policy.allows_reentry ? `Re-entry x${policy.max_entries}` : "Single entry"}</span></div><p className="mt-1 text-xs text-[var(--foreground-muted)]">{policy.valid_dates?.length ? `Valid: ${policy.valid_dates.join(", ")}` : "Event dates"} · {policy.allowed_zone_ids.length ? `${policy.allowed_zone_ids.length} zone(s)` : "All zones"}</p></div>)}</div> : <EmptyState icon={ShieldCheck} title="No policies configured" description="Default general access remains available." />}
        </GlassPanel>
        <GlassPanel>
          <h2 className="mb-3 text-sm font-semibold">Access zones</h2>
          <div className="mb-4 flex flex-wrap gap-2"><Input className="max-w-32" placeholder="Code" value={zoneCode} onChange={(event) => setZoneCode(event.target.value)} /><Input className="max-w-40" placeholder="Name" value={zoneName} onChange={(event) => setZoneName(event.target.value)} /><Button size="sm" onClick={() => { createZone.mutate({ code: zoneCode, name: zoneName }); setZoneCode(""); setZoneName(""); }} disabled={!zoneCode || !zoneName}>Add zone</Button></div>
          {zones.isLoading ? <p>Loading...</p> : zones.data?.length ? <div className="space-y-2">{zones.data.map((zone) => <div key={zone.id} className="rounded border p-3 text-sm"><span className="font-medium">{zone.name}</span><span className="ml-2 text-xs text-[var(--foreground-muted)]">{zone.code}</span></div>)}</div> : <EmptyState icon={ShieldCheck} title="No zones configured" description="Tickets can be validated without zone restrictions." />}
        </GlassPanel>
      </div>
      <GlassPanel>
        <h2 className="mb-3 text-sm font-semibold">Tickets and passes</h2>
        {tickets.isLoading ? <p>Loading...</p> : tickets.data?.items.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs"><th className="p-3">Code</th><th className="p-3">Owner</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Entries</th><th /></tr></thead><tbody>{tickets.data.items.map((ticket) => <tr key={ticket.id} className="border-b"><td className="p-3 font-mono text-xs">{ticket.ticket_code}</td><td className="p-3 font-mono text-xs">{ticket.user_id.slice(0, 8)}</td><td className="p-3 uppercase">{ticket.access_type}</td><td className="p-3 capitalize">{ticket.status.replaceAll("_", " ")}</td><td className="p-3">{ticket.entry_count}</td><td className="p-3 text-right"><div className="flex justify-end gap-2">{["issued", "active"].includes(ticket.status) ? <><Button size="sm" variant="outline" onClick={() => { const userId = window.prompt("Recipient user ID"); if (userId) reassign.mutate({ ticketId: ticket.id, userId }); }}>Reassign</Button><Button size="sm" variant="danger" onClick={() => revoke.mutate(ticket.id)}>Revoke</Button></> : null}</div></td></tr>)}</tbody></table></div> : <EmptyState icon={ShieldCheck} title="No tickets issued" description="Confirmed registrations will appear here." />}
      </GlassPanel>
      <GlassPanel>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Ticket transfers</h2><p className="text-xs text-[var(--foreground-muted)]">Only transfers for this event are visible to authorized staff.</p></div><div className="flex gap-2"><Input className="max-w-56" placeholder="Search ticket code" value={transferSearch} onChange={(event) => { setTransferSearch(event.target.value); setTransferPage(1); }} /><select className="rounded border bg-transparent px-2 text-sm" value={transferStatus} onChange={(event) => { setTransferStatus(event.target.value); setTransferPage(1); }}><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option><option value="">All</option></select></div></div>
        {transfers.isLoading ? <p>Loading transfers...</p> : transfers.data?.items.length ? <><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs"><th className="p-3">Ticket</th><th className="p-3">From</th><th className="p-3">To</th><th className="p-3">Status</th><th className="p-3">Requested</th><th /></tr></thead><tbody>{transfers.data.items.map((transfer) => <tr key={transfer.id} className="border-b"><td className="p-3 font-mono text-xs">{transfer.ticket_id.slice(0, 8)}</td><td className="p-3 font-mono text-xs">{transfer.from_user_id.slice(0, 8)}</td><td className="p-3 font-mono text-xs">{transfer.to_user_id.slice(0, 8)}</td><td className="p-3 capitalize">{transfer.status}</td><td className="p-3 text-xs">{new Date(transfer.created_at).toLocaleString()}</td><td className="p-3 text-right">{transfer.status === "pending" ? <Button size="sm" variant="danger" onClick={() => cancelTransfer.mutate(transfer.id)} disabled={cancelTransfer.isPending}>Cancel</Button> : null}</td></tr>)}</tbody></table></div><div className="mt-3 flex items-center justify-between text-xs"><span>Page {transfers.data.page} of {Math.max(1, Math.ceil(transfers.data.total / transfers.data.page_size))} · {transfers.data.total} total</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={transferPage <= 1} onClick={() => setTransferPage((page) => page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={transferPage >= Math.ceil(transfers.data.total / transfers.data.page_size)} onClick={() => setTransferPage((page) => page + 1)}>Next</Button></div></div></> : <EmptyState icon={ShieldCheck} title="No transfers found" description="Pending ticket transfers will appear here." />}
      </GlassPanel>
    </>}
  </div>;
}
