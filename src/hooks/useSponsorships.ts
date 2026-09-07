import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/state/sessionStore";
import {
  assignSponsorship,
  createSponsorshipInquiry,
  listSponsorshipCategories,
  listSponsorshipInquiries,
  listSponsorshipPackages,
  updateSponsorshipInquiryStatus,
} from "@/api/sponsorships";
import type { SponsorshipInquiryCreate, SponsorshipInquiryStatus } from "@/types/sponsorships";

function useReady() {
  return useSessionStore((state) => state.hydrated && !!state.user);
}

export function useSponsorshipCategories() {
  return useQuery({ queryKey: ["sponsorship", "categories"], queryFn: listSponsorshipCategories });
}

export function useSponsorshipPackages() {
  return useQuery({ queryKey: ["sponsorship", "packages"], queryFn: listSponsorshipPackages });
}

export function useSponsorshipInquiries(eventId?: string, search?: string, status?: string, page = 1) {
  const ready = useReady();
  return useQuery({
    queryKey: ["sponsorship", "inquiries", eventId ?? "all", search ?? "", status ?? "all", page],
    queryFn: () => listSponsorshipInquiries(eventId, page, 25, search, status),
    select: (result) => result.items,
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
