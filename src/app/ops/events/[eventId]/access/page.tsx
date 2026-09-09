"use client";

import { use, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { useAccess, useAccessTransfers, useCancelAccessTransfer, useCreateAccessZone, useReassignAccessTicket, useRevokeAccessTicket, useUpsertAccessPolicy } from "@/hooks/useAccess";

/** Same access/policy/zone/ticket/transfer hooks and mutation payloads as before. */
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

  return (
    <div>
      <Header title="Ticket Access Management" />
      <p className="mb-4 -mt-2 text-sm text-[var(--foreground-muted)]">Event-scoped pass policies, validity, zones, and ticket ownership.</p>

      {error || transfers.isError ? (
        <ErrorState title="Unable to load access configuration" />
      ) : (
        <>
          <div className="mb-4 grid gap-4 lg:grid-cols-2">
            <GlassPanel>
              <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Access policies</h2>
              <div className="mb-3.5 flex flex-wrap items-center gap-2">
                <Input className="max-w-32" placeholder="Type" value={accessType} onChange={(event) => setAccessType(event.target.value)} />
                <Input className="min-w-60" placeholder="Valid dates, YYYY-MM-DD" value={validDates} onChange={(event) => setValidDates(event.target.value)} />
                <Switch checked={reentry} onChange={setReentry} label="Re-entry" />
                <Button
                  size="sm"
                  onClick={() => savePolicy.mutate({ access_type: accessType, allows_reentry: reentry, max_entries: reentry ? 2 : 1, valid_dates: dates })}
                >
                  Save policy
                </Button>
              </div>
              {policies.isLoading ? (
                <p className="text-sm text-[var(--foreground-muted)]">Loading…</p>
              ) : policies.data?.length ? (
                <div className="space-y-2">
                  {policies.data.map((policy) => (
                    <div key={policy.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium uppercase text-[var(--foreground)]">{policy.access_type}</span>
                        <span className="text-[var(--foreground-muted)]">{policy.allows_reentry ? `Re-entry x${policy.max_entries}` : "Single entry"}</span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                        {policy.valid_dates?.length ? `Valid: ${policy.valid_dates.join(", ")}` : "Event dates"} ·{" "}
                        {policy.allowed_zone_ids.length ? `${policy.allowed_zone_ids.length} zone(s)` : "All zones"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={ShieldCheck} title="No policies configured" description="Default general access remains available." />
              )}
            </GlassPanel>

            <GlassPanel>
              <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Access zones</h2>
              <div className="mb-3.5 flex flex-wrap gap-2">
                <Input className="max-w-32" placeholder="Code" value={zoneCode} onChange={(event) => setZoneCode(event.target.value)} />
                <Input className="max-w-40" placeholder="Name" value={zoneName} onChange={(event) => setZoneName(event.target.value)} />
                <Button
                  size="sm"
                  onClick={() => {
                    createZone.mutate({ code: zoneCode, name: zoneName });
                    setZoneCode("");
                    setZoneName("");
                  }}
                  disabled={!zoneCode || !zoneName}
                >
                  Add zone
                </Button>
              </div>
              {zones.isLoading ? (
                <p className="text-sm text-[var(--foreground-muted)]">Loading…</p>
              ) : zones.data?.length ? (
                <div className="space-y-2">
                  {zones.data.map((zone) => (
                    <div key={zone.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3 text-sm">
                      <span className="font-medium text-[var(--foreground)]">{zone.name}</span>
                      <span className="ml-2 text-xs text-[var(--foreground-muted)]">{zone.code}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={ShieldCheck} title="No zones configured" description="Tickets can be validated without zone restrictions." />
              )}
            </GlassPanel>
          </div>

          <GlassPanel padded={false} className="mb-4">
            <h2 className="px-5 pt-4 text-sm font-semibold text-[var(--foreground)]">Tickets and passes</h2>
            {tickets.isLoading ? (
              <p className="p-5 text-sm text-[var(--foreground-muted)]">Loading…</p>
            ) : tickets.data?.items.length ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Code</TableHeaderCell>
                      <TableHeaderCell>Owner</TableHeaderCell>
                      <TableHeaderCell>Type</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Entries</TableHeaderCell>
                      <TableHeaderCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tickets.data.items.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-xs text-[var(--foreground-muted)]">{ticket.ticket_code}</TableCell>
                        <TableCell className="font-mono text-xs text-[var(--foreground-muted)]">{ticket.user_id.slice(0, 8)}</TableCell>
                        <TableCell className="uppercase text-[var(--foreground-muted)]">{ticket.access_type}</TableCell>
                        <TableCell className="capitalize text-[var(--foreground-muted)]">{ticket.status.replaceAll("_", " ")}</TableCell>
                        <TableCell className="text-[var(--foreground-muted)]">{ticket.entry_count}</TableCell>
                        <TableCell>
                          {["issued", "active"].includes(ticket.status) && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const userId = window.prompt("Recipient user ID");
                                  if (userId) reassign.mutate({ ticketId: ticket.id, userId });
                                }}
                              >
                                Reassign
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => revoke.mutate(ticket.id)}>
                                Revoke
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <div className="p-5">
                <EmptyState icon={ShieldCheck} title="No tickets issued" description="Confirmed registrations will appear here." />
              </div>
            )}
          </GlassPanel>

          <GlassPanel padded={false}>
            <div className="px-5 pt-4">
              <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--foreground)]">Ticket transfers</h2>
                  <p className="text-xs text-[var(--foreground-muted)]">Only transfers for this event are visible to authorized staff.</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    className="max-w-56"
                    placeholder="Search ticket code"
                    value={transferSearch}
                    onChange={(event) => {
                      setTransferSearch(event.target.value);
                      setTransferPage(1);
                    }}
                  />
                  <Select
                    className="w-36"
                    value={transferStatus}
                    onChange={(event) => {
                      setTransferStatus(event.target.value);
                      setTransferPage(1);
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="">All</option>
                  </Select>
                </div>
              </div>
            </div>
            {transfers.isLoading ? (
              <p className="p-5 text-sm text-[var(--foreground-muted)]">Loading transfers…</p>
            ) : transfers.data?.items.length ? (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell>Ticket</TableHeaderCell>
                        <TableHeaderCell>From</TableHeaderCell>
                        <TableHeaderCell>To</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Requested</TableHeaderCell>
                        <TableHeaderCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transfers.data.items.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-mono text-xs text-[var(--foreground-muted)]">{transfer.ticket_id.slice(0, 8)}</TableCell>
                          <TableCell className="font-mono text-xs text-[var(--foreground-muted)]">{transfer.from_user_id.slice(0, 8)}</TableCell>
                          <TableCell className="font-mono text-xs text-[var(--foreground-muted)]">{transfer.to_user_id.slice(0, 8)}</TableCell>
                          <TableCell className="capitalize text-[var(--foreground-muted)]">{transfer.status}</TableCell>
                          <TableCell className="text-xs text-[var(--foreground-muted)]">{new Date(transfer.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            {transfer.status === "pending" && (
                              <div className="flex justify-end">
                                <Button size="sm" variant="danger" onClick={() => cancelTransfer.mutate(transfer.id)} disabled={cancelTransfer.isPending}>
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Pagination
                  page={transfers.data.page}
                  totalPages={Math.max(1, Math.ceil(transfers.data.total / transfers.data.page_size))}
                  totalItems={transfers.data.total}
                  onPageChange={setTransferPage}
                />
              </>
            ) : (
              <div className="p-5">
                <EmptyState icon={ShieldCheck} title="No transfers found" description="Pending ticket transfers will appear here." />
              </div>
            )}
          </GlassPanel>
        </>
      )}
    </div>
  );
}