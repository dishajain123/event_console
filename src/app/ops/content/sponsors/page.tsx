"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Handshake, Plus, Trash2, Building2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { TableSkeleton } from "@/components/shared/skeleton";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { useEvents } from "@/hooks/useEvents";
import { useAddSponsor, useAllSponsors, useEventSponsors, useRemoveSponsor } from "@/hooks/useSponsors";
import {
  useAssignSponsorship,
  useSponsorshipInquiries,
  useUpdateSponsorshipInquiryStatus,
} from "@/hooks/useSponsorships";
import { COMMON_SPONSOR_TIERS } from "@/types/sponsors";
import type { SponsorOut } from "@/types/sponsors";

const schema = z.object({
  name: z.string().min(1, "Sponsor name is required"),
  tier: z.string().optional(),
  logo_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export default function SponsorsPage() {
  const { data: events } = useEvents();
  const [eventId, setEventId] = useState("");
  const { data: sponsors, isLoading, isError, refetch } = useEventSponsors(eventId);
  const { data: allSponsors } = useAllSponsors();
  const addSponsor = useAddSponsor(eventId);
  const removeSponsor = useRemoveSponsor(eventId);
  const [removeTarget, setRemoveTarget] = useState<SponsorOut | null>(null);
  const { data: inquiries } = useSponsorshipInquiries(eventId || undefined);
  const updateInquiry = useUpdateSponsorshipInquiryStatus();
  const assignInquiry = useAssignSponsorship();
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatus, setInquiryStatus] = useState("all");
  const [detailId, setDetailId] = useState<string | null>(null);
  const visibleInquiries = useMemo(() => (inquiries ?? []).filter((inquiry) => {
    const search = inquirySearch.trim().toLowerCase();
    const matchesSearch = !search || [inquiry.company_name, inquiry.contact_person, inquiry.email]
      .some((value) => value.toLowerCase().includes(search));
    return matchesSearch && (inquiryStatus === "all" || inquiry.status === inquiryStatus);
  }), [inquiries, inquirySearch, inquiryStatus]);

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

      <div className="mb-4">
        <Select className="w-64" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">Select an event…</option>
          {(events ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
      </div>

      {!eventId ? (
        <GlassPanel>
          <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">All confirmed sponsors</h2>
          {!allSponsors || allSponsors.length === 0 ? (
            <EmptyState icon={Handshake} title="No confirmed sponsors" />
          ) : (
            <div className="divide-y divide-black/[0.05]">
              {allSponsors.map((sponsor) => (
                <div key={sponsor.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{sponsor.name}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Event: {sponsor.event_id}</p>
                  </div>
                  <Badge tone="accent" className="capitalize">{sponsor.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
          <GlassPanel className="rise-in h-fit">
            <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Add sponsor</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Sponsor name
                </label>
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
                    <Input
                      list="sponsor-tier-suggestions"
                      placeholder="e.g. gold"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
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
                {errors.logo_url && (
                  <p className="mt-1 text-xs text-[var(--danger)]">{errors.logo_url.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" loading={addSponsor.isPending}>
                <Plus className="h-4 w-4" />
                Add sponsor
              </Button>
            </form>
          </GlassPanel>

          <GlassPanel padded={false}>
            <div className="border-b border-black/[0.06] px-6 py-4">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Sponsors</h2>
            </div>
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton rows={3} cols={2} />
              </div>
            ) : isError ? (
              <div className="p-6">
                <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
              </div>
            ) : !sponsors || sponsors.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={Handshake} title="No sponsors added yet" />
              </div>
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] overflow-hidden">
                        {sponsor.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={sponsor.logo_url} alt={sponsor.name} className="h-full w-full object-contain" />
                        ) : (
                          <Building2 className="h-5 w-5 text-[var(--accent-strong)]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{sponsor.name}</p>
                        {sponsor.tier && (
                          <Badge tone="accent" className="mt-0.5 capitalize">
                            {sponsor.tier}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setRemoveTarget(sponsor)}>
                      <Trash2 className="h-3.5 w-3.5 text-[var(--danger)]" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      )}

      <ConfirmActionDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title={`Remove "${removeTarget?.name}"?`}
        description="This removes them from the event's public sponsor listing immediately."
        confirmLabel="Remove sponsor"
        tone="danger"
        onConfirm={handleRemove}
      />

      <GlassPanel className="mt-8" padded={false}>
        <div className="border-b border-black/[0.06] px-6 py-4">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Sponsorship inquiries</h2>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">
            Results are scoped by the backend to Operations access or the selected managed event.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Input className="max-w-xs" placeholder="Search company, contact, email" value={inquirySearch} onChange={(event) => setInquirySearch(event.target.value)} />
            <Select className="w-40" value={inquiryStatus} onChange={(event) => setInquiryStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="approved">Approved</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </Select>
          </div>
        </div>
        {!visibleInquiries.length ? (
          <div className="p-6"><EmptyState icon={Handshake} title="No sponsorship inquiries" /></div>
        ) : (
          <div className="divide-y divide-black/[0.05]">
            {visibleInquiries.map((inquiry) => (
              <div key={inquiry.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <button type="button" className="text-left text-sm font-medium text-[var(--foreground)]" onClick={() => setDetailId(detailId === inquiry.id ? null : inquiry.id)}>{inquiry.company_name}</button>
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
      </GlassPanel>
    </div>
  );
}
