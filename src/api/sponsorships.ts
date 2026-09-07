import { apiClient } from "@/api/client";
import type {
  SponsorshipCategory,
  SponsorshipInquiry,
  SponsorshipInquiryCreate,
  SponsorshipInquiryStatus,
  SponsorshipPackage,
  ManagedSponsor,
  SponsorshipDeliverable,
  SponsorshipDeliverablePage,
  SponsorshipMetrics,
  SponsorEngagement,
  SponsorEngagementMetrics,
  SponsorEngagementPage,
  SponsorEngagementType,
  SponsorLeadStatus,
} from "@/types/sponsorships";
export type SponsorshipInquiryPage = { items: SponsorshipInquiry[]; total: number; page: number; page_size: number };
export type ManagedSponsorPage = { items: ManagedSponsor[]; total: number; page: number; page_size: number };

export async function listSponsorshipCategories(): Promise<SponsorshipCategory[]> {
  const { data } = await apiClient.get<SponsorshipCategory[]>("/sponsorship/categories");
  return data;
}

export async function listSponsorshipPackages(): Promise<SponsorshipPackage[]> {
  const { data } = await apiClient.get<SponsorshipPackage[]>("/sponsorship/packages");
  return data;
}

export async function listSponsorshipInquiries(eventId?: string, page = 1, pageSize = 25, search?: string, status?: string): Promise<SponsorshipInquiryPage> {
  const { data } = await apiClient.get<SponsorshipInquiryPage>("/sponsorship/inquiries", {
    params: { page, page_size: pageSize, ...(eventId ? { event_id: eventId } : {}), ...(search ? { search } : {}), ...(status && status !== "all" ? { status } : {}) },
  });
  return data;
}

export async function createSponsorshipInquiry(payload: SponsorshipInquiryCreate): Promise<SponsorshipInquiry> {
  const { data } = await apiClient.post<SponsorshipInquiry>("/sponsorship/inquiries", payload);
  return data;
}

export async function updateSponsorshipInquiryStatus(
  inquiryId: string,
  status: SponsorshipInquiryStatus,
): Promise<SponsorshipInquiry> {
  const { data } = await apiClient.patch<SponsorshipInquiry>(
    `/sponsorship/inquiries/${inquiryId}/status`,
    { status },
  );
  return data;
}

export async function assignSponsorship(
  inquiryId: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { data } = await apiClient.post<Record<string, unknown>>(
    `/sponsorship/inquiries/${inquiryId}/assign`,
    payload,
  );
  return data;
}

export async function listManagedSponsors(params: { eventId?: string; page?: number; pageSize?: number; search?: string; status?: string; category?: string } = {}): Promise<ManagedSponsorPage> {
  const { data } = await apiClient.get<ManagedSponsorPage>("/sponsorship/sponsors", {
    params: {
      page: params.page ?? 1,
      page_size: params.pageSize ?? 25,
      ...(params.eventId ? { event_id: params.eventId } : {}),
      ...(params.search ? { search: params.search } : {}),
      ...(params.status && params.status !== "all" ? { status: params.status } : {}),
      ...(params.category ? { category: params.category } : {}),
    },
  });
  return data;
}

export async function getSponsorshipMetrics(eventId: string): Promise<SponsorshipMetrics> {
  const { data } = await apiClient.get<SponsorshipMetrics>(`/sponsorship/events/${eventId}/metrics`);
  return data;
}

export async function listSponsorDeliverables(sponsorId: string, status?: string, page = 1): Promise<SponsorshipDeliverablePage> {
  const { data } = await apiClient.get<SponsorshipDeliverablePage>(`/sponsorship/sponsors/${sponsorId}/deliverables`, {
    params: { page, page_size: 25, ...(status && status !== "all" ? { status } : {}) },
  });
  return data;
}

export async function updateSponsorDeliverable(deliverableId: string, payload: Partial<Pick<SponsorshipDeliverable, "status" | "completion_notes" | "evidence">>): Promise<SponsorshipDeliverable> {
  const { data } = await apiClient.patch<SponsorshipDeliverable>(`/sponsorship/deliverables/${deliverableId}`, payload);
  return data;
}

export async function updateSponsorStatus(sponsorId: string, status: string): Promise<ManagedSponsor> {
  const { data } = await apiClient.patch<ManagedSponsor>(`/sponsorship/sponsors/${sponsorId}/status`, { status });
  return data;
}

export async function listSponsorEngagements(eventId: string, sponsorId: string, params: { page?: number; status?: SponsorLeadStatus; engagementType?: SponsorEngagementType; consentStatus?: string; search?: string } = {}): Promise<SponsorEngagementPage> {
  const { data } = await apiClient.get<SponsorEngagementPage>(`/sponsorship/events/${eventId}/engagements`, { params: { sponsor_id: sponsorId, page: params.page ?? 1, page_size: 25, ...(params.status ? { status: params.status } : {}), ...(params.engagementType ? { engagement_type: params.engagementType } : {}), ...(params.consentStatus ? { consent_status: params.consentStatus } : {}), ...(params.search ? { search: params.search } : {}) } });
  return data;
}

export async function updateSponsorEngagementStatus(id: string, status: SponsorLeadStatus): Promise<SponsorEngagement> {
  const { data } = await apiClient.patch<SponsorEngagement>(`/sponsorship/engagements/${id}/status`, { status });
  return data;
}

export async function updateSponsorEngagementConsent(id: string, consentGiven: boolean, consentSource?: string): Promise<SponsorEngagement> {
  const { data } = await apiClient.patch<SponsorEngagement>(`/sponsorship/engagements/${id}/consent`, { consent_given: consentGiven, consent_source: consentSource });
  return data;
}

export async function getSponsorEngagementMetrics(eventId: string, sponsorId: string): Promise<SponsorEngagementMetrics> {
  const { data } = await apiClient.get<SponsorEngagementMetrics>(`/sponsorship/events/${eventId}/sponsors/${sponsorId}/engagement-metrics`);
  return data;
}
