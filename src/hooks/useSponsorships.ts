import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/state/sessionStore";
import {
  assignSponsorship,
  createSponsorshipInquiry,
  listSponsorshipCategories,
  listSponsorshipInquiries,
  listSponsorshipPackages,
  updateSponsorshipInquiryStatus,
  getSponsorshipMetrics,
  listManagedSponsors,
  listSponsorDeliverables,
  updateSponsorDeliverable,
  updateSponsorStatus,
  listSponsorEngagements,
  updateSponsorEngagementStatus,
  updateSponsorEngagementConsent,
  getSponsorEngagementMetrics,
} from "@/api/sponsorships";
import type { SponsorEngagementType, SponsorLeadStatus, SponsorshipDeliverableStatus, SponsorshipInquiryCreate, SponsorshipInquiryStatus } from "@/types/sponsorships";

function useReady() {
  return useSessionStore((state) => state.hydrated && !!state.user);
}

export function useSponsorshipCategories() {
  return useQuery({ queryKey: ["sponsorship", "categories"], queryFn: listSponsorshipCategories });
}

export function useSponsorshipPackages() {
  return useQuery({ queryKey: ["sponsorship", "packages"], queryFn: listSponsorshipPackages });
}

/**
 * Same `listSponsorshipInquiries` call and params as before. `select`
 * that discarded everything but `items` removed — this hook has this
 * one call site (the Sponsors page), so exposing the full page here
 * (rather than adding a parallel hook, as done for events/accounts)
 * doesn't risk any other consumer. Callers that only used `.data` as
 * an array now read `.data?.items` instead; `.data?.total` drives real
 * pagination.
 */
export function useSponsorshipInquiries(eventId?: string, search?: string, status?: string, page = 1) {
  const ready = useReady();
  return useQuery({
    queryKey: ["sponsorship", "inquiries", eventId ?? "all", search ?? "", status ?? "all", page],
    queryFn: () => listSponsorshipInquiries(eventId, page, 25, search, status),
    enabled: ready,
  });
}

export function useCreateSponsorshipInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SponsorshipInquiryCreate) => createSponsorshipInquiry(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsorship", "inquiries"] }),
  });
}

export function useUpdateSponsorshipInquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inquiryId, status }: { inquiryId: string; status: SponsorshipInquiryStatus }) =>
      updateSponsorshipInquiryStatus(inquiryId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsorship", "inquiries"] }),
  });
}

export function useAssignSponsorship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inquiryId, payload }: { inquiryId: string; payload: Record<string, unknown> }) =>
      assignSponsorship(inquiryId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsorship", "inquiries"] }),
  });
}

export function useManagedSponsors(eventId?: string, search?: string, status?: string, page = 1) {
  const ready = useReady();
  return useQuery({
    queryKey: ["sponsorship", "managed-sponsors", eventId ?? "all", search ?? "", status ?? "all", page],
    queryFn: () => listManagedSponsors({ eventId, search, status, page, pageSize: 25 }),
    enabled: ready,
  });
}

export function useSponsorshipMetrics(eventId?: string) {
  const ready = useReady();
  return useQuery({
    queryKey: ["sponsorship", "metrics", eventId],
    queryFn: () => getSponsorshipMetrics(eventId as string),
    enabled: ready && !!eventId,
  });
}

export function useSponsorDeliverables(sponsorId?: string) {
  const ready = useReady();
  return useQuery({
    queryKey: ["sponsorship", "deliverables", sponsorId],
    queryFn: () => listSponsorDeliverables(sponsorId as string, undefined, 1),
    enabled: ready && !!sponsorId,
  });
}

export function useUpdateSponsorDeliverable() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ deliverableId, status, completionNotes }: { deliverableId: string; status: SponsorshipDeliverableStatus; completionNotes?: string }) => updateSponsorDeliverable(deliverableId, { status, completion_notes: completionNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sponsorship", "deliverables"] });
      queryClient.invalidateQueries({ queryKey: ["sponsorship", "managed-sponsors"] });
    },
  });
}

export function useUpdateSponsorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sponsorId, status }: { sponsorId: string; status: string }) => updateSponsorStatus(sponsorId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsorship"] }),
  });
}

export function useSponsorEngagements(eventId?: string, sponsorId?: string, page = 1, search?: string, status?: SponsorLeadStatus, engagementType?: SponsorEngagementType) {
  const ready = useReady();
  return useQuery({ queryKey: ["sponsorship", "engagements", eventId, sponsorId, page, search ?? "", status ?? "all", engagementType ?? "all"], queryFn: () => listSponsorEngagements(eventId as string, sponsorId as string, { page, search, status, engagementType }), enabled: ready && !!eventId && !!sponsorId });
}

export function useSponsorEngagementMetrics(eventId?: string, sponsorId?: string) {
  const ready = useReady();
  return useQuery({ queryKey: ["sponsorship", "engagement-metrics", eventId, sponsorId], queryFn: () => getSponsorEngagementMetrics(eventId as string, sponsorId as string), enabled: ready && !!eventId && !!sponsorId });
}

export function useUpdateSponsorEngagementStatus() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, status }: { id: string; status: SponsorLeadStatus }) => updateSponsorEngagementStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsorship", "engagements"] }) });
}

export function useUpdateSponsorEngagementConsent() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, consentGiven, consentSource }: { id: string; consentGiven: boolean; consentSource?: string }) => updateSponsorEngagementConsent(id, consentGiven, consentSource), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sponsorship", "engagements"] }) });
}