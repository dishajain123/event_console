"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Handshake, Plus, Trash2, Building2, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { TableSkeleton } from "@/components/shared/skeleton";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { useEvents } from "@/hooks/useEvents";
import { useAddSponsor, useRemoveSponsor } from "@/hooks/useSponsors";
import {
  useAssignSponsorship,
  useManagedSponsors,
  useSponsorDeliverables,
  useSponsorshipMetrics,
  useSponsorshipInquiries,
  useUpdateSponsorDeliverable,
  useUpdateSponsorshipInquiryStatus,
  useSponsorEngagements,
  useSponsorEngagementMetrics,
  useUpdateSponsorEngagementConsent,
  useUpdateSponsorEngagementStatus,
} from "@/hooks/useSponsorships";
import { COMMON_SPONSOR_TIERS } from "@/types/sponsors";
import type { ManagedSponsor, SponsorEngagementType, SponsorLeadStatus } from "@/types/sponsorships";

const schema = z.object({
  name: z.string().min(1, "Sponsor name is required"),
  tier: z.string().optional(),
  logo_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

const SPONSOR_PAGE_SIZE = 25;

/**
 * Every hook and mutation below is unchanged from before — same
 * `useManagedSponsors`/`useSponsorshipInquiries`/engagement/deliverable
 * calls, same arguments. `useSponsorshipInquiries` no longer discards
 * `total` (see the hook's own comment), so its pager now shows real
 * page counts instead of "disabled once fewer than 25 results come
 * back". Structurally: Approved Sponsors and Sponsorship Inquiries are
 * now two clearly labeled [Tabs], not two sections a user has to
 * scroll past each other to notice — with the previous distinguishing
 * detail (whether an inquiry has been confirmed as a sponsor) shown as
 * a badge either way rather than being the only signal of which
 * workflow they're in.
 */
export default function SponsorsPage() {
  const { data: events } = useEvents();
  const [eventId, setEventId] = useState("");
  const [activeTab, setActiveTab] = useState<"sponsors" | "inquiries">("sponsors");

  const [sponsorSearch, setSponsorSearch] = useState("");
  const [sponsorStatus, setSponsorStatus] = useState("all");
  const [sponsorPage, setSponsorPage] = useState(1);
  const { data: managedSponsors, isLoading, isError, refetch } = useManagedSponsors(eventId || undefined, sponsorSearch, sponsorStatus, sponsorPage);
  const addSponsor = useAddSponsor(eventId);
  const removeSponsor = useRemoveSponsor(eventId);
  const [removeTarget, setRemoveTarget] = useState<ManagedSponsor | null>(null);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | undefined>();
  const { data: metrics } = useSponsorshipMetrics(eventId || undefined);
  const { data: deliverables } = useSponsorDeliverables(selectedSponsorId);

  const [engagementPage, setEngagementPage] = useState(1);
  const [engagementSearch, setEngagementSearch] = useState("");
  const [engagementStatus, setEngagementStatus] = useState<string>("");
  const [engagementType, setEngagementType] = useState<string>("");
  const { data: engagementData, isLoading: engagementLoading, isError: engagementError } = useSponsorEngagements(
    eventId || undefined,
    selectedSponsorId,
    engagementPage,
    engagementSearch,
    engagementStatus ? (engagementStatus as SponsorLeadStatus) : undefined,
    engagementType ? (engagementType as SponsorEngagementType) : undefined,
  );
  const { data: engagementMetrics } = useSponsorEngagementMetrics(eventId || undefined, selectedSponsorId);
  const updateEngagementStatus = useUpdateSponsorEngagementStatus();
  const updateEngagementConsent = useUpdateSponsorEngagementConsent();
  const updateDeliverable = useUpdateSponsorDeliverable();

  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState("all");
  const [inquiryPage, setInquiryPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const { data: inquiryData } = useSponsorshipInquiries(eventId || undefined, inquirySearch, inquiryStatus, inquiryPage);
  const updateInquiry = useUpdateSponsorshipInquiryStatus();
  const assignInquiry = useAssignSponsorship();
  const visibleInquiries = inquiryData?.items ?? [];
  const inquiryTotalPages = inquiryData ? Math.max(1, Math.ceil(inquiryData.total / 25)) : 1;
  const sponsors = managedSponsors?.items ?? [];
  const sponsorTotalPages = managedSponsors ? Math.max(1, Math.ceil(managedSponsors.total / SPONSOR_PAGE_SIZE)) : 1;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await addSponsor.mutateAsync({
        name: values.name,
        tier: values.tier || null,
        logo_url: values.logo_url || null,
      });
      toast.success("Sponsor added");
      reset();
    } catch (err) {
      toast.error("Couldn't add sponsor", { description: (err as { message?: string })?.message });
    }
  }

  async function handleRemove() {
    if (!removeTarget) return;
    await removeSponsor.mutateAsync(removeTarget.id);
    toast.success(`Removed "${removeTarget.name}"`);
  }

  return (
    <div>
      <Header title="Sponsors" />
      <PageToolbar
        description="Approved sponsors and inbound sponsorship inquiries, kept as two separate workflows."
        actions={
          <Select className="w-64" value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">All events</option>
            {(events ?? []).map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </Select>
        }
      />

      <Tabs
        className="mb-4"
        active={activeTab}
        onChange={(key) => setActiveTab(key as "sponsors" | "inquiries")}
        items={[
          { key: "sponsors", label: "Approved sponsors", count: sponsors.length },
          { key: "inquiries", label: "Sponsorship inquiries", count: visibleInquiries.length },
        ]}
      />

      <TabPanel active={activeTab} tabKey="sponsors">
        {!eventId ? (
          <GlassPanel padded={false}>
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">All confirmed sponsors</h2>
              <span className="text-xs text-[var(--foreground-subtle)]">Select an event above to add or manage sponsors</span>
            </div>
            {sponsors.length === 0 ? (
              <div className="p-5">
                <EmptyState icon={Handshake} title="No confirmed sponsors" />
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{sponsor.name}</p>
                      <p className="text-xs text-[var(--foreground-muted)]">Event: {sponsor.event_id}</p>
                    </div>
                    <Badge tone="accent" className="capitalize">{sponsor.status}</Badge>
                  </div>
                ))}
              </div>
            )}
            <Pagination page={sponsorPage} totalPages={sponsorTotalPages} totalItems={managedSponsors?.total} onPageChange={setSponsorPage} />
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
            <GlassPanel className="rise-in h-fit">
              <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Add sponsor</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Sponsor name</label>
                  <Input placeholder="Acme Corp" {...register("name")} />
                  {errors.name && <p className="mt-1 text-xs text-[var(--danger)]">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                    Tier <span className="text-[var(--foreground-subtle)]">(optional, any label)</span>
                  </label>
                  <Controller
                    control={control}
                    name="tier"
                    render={({ field }) => (
                      <Input list="sponsor-tier-suggestions" placeholder="e.g. gold" value={field.value ?? ""} onChange={field.onChange} />
                    )}
                  />
                  <datalist id="sponsor-tier-suggestions">
                    {COMMON_SPONSOR_TIERS.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                    Logo URL <span className="text-[var(--foreground-subtle)]">(optional)</span>
                  </label>
                  <Input placeholder="https://…" {...register("logo_url")} />
                  {errors.logo_url && <p className="mt-1 text-xs text-[var(--danger)]">{errors.logo_url.message}</p>}
                </div>
                <Button type="submit" className="w-full" loading={addSponsor.isPending}>
                  <Plus className="h-4 w-4" />
                  Add sponsor
                </Button>
              </form>
            </GlassPanel>

            <GlassPanel padded={false}>
              <div className="border-b border-[var(--border)] px-5 py-3.5">
                <h2 className="text-sm font-semibold text-[var(--foreground)]">Sponsors</h2>
                <FilterBar
                  className="mt-3 mb-0"
                  isFiltered={sponsorSearch !== "" || sponsorStatus !== "all"}
                  onReset={() => {
                    setSponsorSearch("");
                    setSponsorStatus("all");
                    setSponsorPage(1);
                  }}
                >
                  <Input
                    className="max-w-xs"
                    placeholder="Search sponsors"
                    value={sponsorSearch}
                    onChange={(event) => {
                      setSponsorSearch(event.target.value);
                      setSponsorPage(1);
                    }}
                  />
                  <Select
                    className="w-40"
                    value={sponsorStatus}
                    onChange={(event) => {
                      setSponsorStatus(event.target.value);
                      setSponsorPage(1);
                    }}
                  >
                    <option value="all">All statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </FilterBar>
              </div>

              {isLoading ? (
                <div className="p-5">
                  <TableSkeleton rows={3} cols={2} />
                </div>
              ) : isError ? (
                <div className="p-5">
                  <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
                </div>
              ) : sponsors.length === 0 ? (
                <div className="p-5">
                  <EmptyState icon={Handshake} title="No sponsors added yet" />
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {sponsors.map((sponsor) => (
                    <div key={sponsor.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] bg-[var(--accent-soft)]">
                          {sponsor.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={sponsor.logo_url} alt={sponsor.name} className="h-full w-full object-contain" />
                          ) : (
                            <Building2 className="h-4 w-4 text-[var(--accent-strong)]" />
                          )}
                        </div>
                        <div>
                          <button
                            type="button"
                            className="text-left text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-strong)]"
                            onClick={() => setSelectedSponsorId(selectedSponsorId === sponsor.id ? undefined : sponsor.id)}
                          >
                            {sponsor.name}
                          </button>
                          {sponsor.tier && (
                            <Badge tone="accent" className="mt-0.5 capitalize">
                              {sponsor.tier}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone="neutral" className="capitalize">{sponsor.status}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => setRemoveTarget(sponsor)}>
                          <Trash2 className="h-3.5 w-3.5 text-[var(--danger)]" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination page={sponsorPage} totalPages={sponsorTotalPages} totalItems={managedSponsors?.total} onPageChange={setSponsorPage} />

              {selectedSponsorId && deliverables && (
                <div className="border-t border-[var(--border)] p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Deliverables</p>
                  {deliverables.items.length === 0 ? (
                    <p className="text-xs text-[var(--foreground-muted)]">No deliverables recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {deliverables.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] bg-[var(--surface-muted)] p-3">
                          <div>
                            <p className="text-sm text-[var(--foreground)]">{item.deliverable_type}: {item.description}</p>
                            <p className="text-xs text-[var(--foreground-muted)]">
                              {item.due_date ? `Due ${new Date(item.due_date).toLocaleDateString()}` : "No due date"}
                            </p>
                          </div>
                          <Select
                            className="w-36"
                            value={item.status}
                            onChange={(event) =>
                              updateDeliverable.mutate({
                                deliverableId: item.id,
                                status: event.target.value as "pending" | "in_progress" | "completed" | "cancelled",
                              })
                            }
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedSponsorId && eventId && (
                <div className="border-t border-[var(--border)] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-muted)]">Sponsor engagement</p>
                    {engagementMetrics && (
                      <div className="flex gap-3 text-xs text-[var(--foreground-muted)]">
                        <span>Leads {engagementMetrics.total_leads}</span>
                        <span>Converted {engagementMetrics.converted_leads}</span>
                        <span>Engaged {engagementMetrics.unique_participants_engaged}</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Input
                      className="max-w-xs"
                      placeholder="Search opted-in participant"
                      value={engagementSearch}
                      onChange={(event) => {
                        setEngagementSearch(event.target.value);
                        setEngagementPage(1);
                      }}
                    />
                    <Select
                      className="w-40"
                      value={engagementStatus}
                      onChange={(event) => {
                        setEngagementStatus(event.target.value);
                        setEngagementPage(1);
                      }}
                    >
                      <option value="">All lead statuses</option>
                      <option value="captured">Captured</option>
                      <option value="qualified">Qualified</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="dismissed">Dismissed</option>
                      <option value="unsubscribed">Unsubscribed</option>
                    </Select>
                    <Select
                      className="w-44"
                      value={engagementType}
                      onChange={(event) => {
                        setEngagementType(event.target.value);
                        setEngagementPage(1);
                      }}
                    >
                      <option value="">All engagement types</option>
                      <option value="lead_capture">Lead capture</option>
                      <option value="booth_visit">Booth visit</option>
                      <option value="session_interest">Session interest</option>
                      <option value="sponsor_interaction">Sponsor interaction</option>
                    </Select>
                  </div>
                  {engagementLoading ? (
                    <TableSkeleton rows={3} cols={3} />
                  ) : engagementError ? (
                    <p className="text-sm text-[var(--danger)]">Unable to load sponsor engagement.</p>
                  ) : !engagementData?.items.length ? (
                    <p className="text-sm text-[var(--foreground-muted)]">No engagement records.</p>
                  ) : (
                    <div className="space-y-2">
                      {engagementData.items.map((item) => (
                        <div key={item.id} className="rounded-[var(--radius-sm)] bg-[var(--surface-muted)] p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-[var(--foreground)]">{item.participant_display_name ?? "Opted-in participant"}</p>
                              <p className="text-xs text-[var(--foreground-muted)]">
                                {item.participant_organization ?? ""} {item.participant_designation ? `· ${item.participant_designation}` : ""} ·{" "}
                                {item.engagement_type.replaceAll("_", " ")}
                              </p>
                            </div>
                            <Badge tone="neutral" className="capitalize">{item.lead_status}</Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.lead_status === "captured" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateEngagementStatus.mutate({ id: item.id, status: "qualified" }, { onError: () => toast.error("Unable to update lead") })}
                              >
                                Qualify
                              </Button>
                            )}
                            {item.lead_status === "qualified" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateEngagementStatus.mutate({ id: item.id, status: "contacted" }, { onError: () => toast.error("Unable to update lead") })}
                              >
                                Mark contacted
                              </Button>
                            )}
                            {item.lead_status === "contacted" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateEngagementStatus.mutate({ id: item.id, status: "converted" }, { onError: () => toast.error("Unable to update lead") })}
                              >
                                Mark converted
                              </Button>
                            )}
                            {["captured", "qualified", "contacted", "converted"].includes(item.lead_status) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateEngagementStatus.mutate({ id: item.id, status: "dismissed" }, { onError: () => toast.error("Unable to update lead") })}
                              >
                                Dismiss
                              </Button>
                            )}
                            {item.consent_status === "given" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateEngagementConsent.mutate({ id: item.id, consentGiven: false }, { onError: () => toast.error("Unable to withdraw consent") })}
                              >
                                Unsubscribe
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Pagination
                    page={engagementPage}
                    totalPages={engagementData ? Math.max(1, Math.ceil(engagementData.total / 25)) : 1}
                    totalItems={engagementData?.total}
                    onPageChange={setEngagementPage}
                  />
                </div>
              )}
            </GlassPanel>
          </div>
        )}

        {eventId && metrics && (
          <GlassPanel className="mt-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div>
                <p className="text-xs text-[var(--foreground-muted)]">Sponsors</p>
                <p className="text-xl font-semibold text-[var(--foreground)]">{metrics.total_sponsors}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--foreground-muted)]">Committed</p>
                <p className="text-xl font-semibold text-[var(--foreground)]">{metrics.confirmed_value}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--foreground-muted)]">Deliverables</p>
                <p className="text-xl font-semibold text-[var(--foreground)]">{metrics.completed_deliverables}/{metrics.total_deliverables}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--foreground-muted)]">Overdue</p>
                <p className="text-xl font-semibold text-[var(--danger)]">{metrics.overdue_deliverables}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--foreground-muted)]">Fulfillment</p>
                <p className="text-xl font-semibold text-[var(--foreground)]">{metrics.fulfillment_percentage ?? 0}%</p>
              </div>
            </div>
          </GlassPanel>
        )}
      </TabPanel>

      <TabPanel active={activeTab} tabKey="inquiries">
        <GlassPanel padded={false}>
          <div className="border-b border-[var(--border)] px-5 py-3.5">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Sponsorship inquiries</h2>
            <p className="mt-1 text-xs text-[var(--foreground-muted)]">
              Results are scoped by the backend to Operations access or the selected managed event.
            </p>
            <FilterBar
              className="mt-3 mb-0"
              isFiltered={inquirySearch !== "" || inquiryStatus !== "all"}
              onReset={() => {
                setInquirySearch("");
                setInquiryStatus("all");
                setInquiryPage(1);
              }}
            >
              <div className="relative max-w-xs flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
                <Input className="pl-9" placeholder="Search company, contact, email" value={inquirySearch} onChange={(event) => setInquirySearch(event.target.value)} />
              </div>
              <Select className="w-40" value={inquiryStatus} onChange={(event) => setInquiryStatus(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="approved">Approved</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
                <option value="closed">Closed</option>
              </Select>
            </FilterBar>
          </div>
          {!visibleInquiries.length ? (
            <div className="p-5">
              <EmptyState icon={Handshake} title="No sponsorship inquiries" />
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {visibleInquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
                  <div>
                    <button
                      type="button"
                      className="text-left text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-strong)]"
                      onClick={() => setDetailId(detailId === inquiry.id ? null : inquiry.id)}
                    >
                      {inquiry.company_name}
                    </button>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      {inquiry.contact_person} · {inquiry.email} · {inquiry.event_ids.length} event(s)
                    </p>
                    <Badge tone="neutral" className="mt-1 capitalize">{inquiry.status}</Badge>
                    {detailId === inquiry.id && (
                      <p className="mt-2 max-w-xl text-xs text-[var(--foreground-muted)]">
                        {inquiry.business_details || inquiry.message || "No additional details provided."}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {inquiry.status !== "confirmed" && inquiry.status !== "rejected" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => updateInquiry.mutate({ inquiryId: inquiry.id, status: "approved" })}>
                          Approve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateInquiry.mutate({ inquiryId: inquiry.id, status: "rejected" })}>
                          Reject
                        </Button>
                      </>
                    )}
                    {eventId && inquiry.event_ids.includes(eventId) && inquiry.status === "approved" && (
                      <Button size="sm" onClick={() => assignInquiry.mutate({ inquiryId: inquiry.id, payload: { event_id: eventId } })}>
                        Confirm for event
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Pagination page={inquiryPage} totalPages={inquiryTotalPages} totalItems={inquiryData?.total} onPageChange={setInquiryPage} />
        </GlassPanel>
      </TabPanel>

      <ConfirmActionDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title={`Remove "${removeTarget?.name}"?`}
        description="This removes them from the event's public sponsor listing immediately."
        confirmLabel="Remove sponsor"
        tone="danger"
        onConfirm={handleRemove}
      />
    </div>
  );
}