import { apiClient } from "@/api/client";
import type {
  SponsorshipCategory,
  SponsorshipInquiry,
  SponsorshipInquiryCreate,
  SponsorshipInquiryStatus,
  SponsorshipPackage,
} from "@/types/sponsorships";

export async function listSponsorshipCategories(): Promise<SponsorshipCategory[]> {
  const { data } = await apiClient.get<SponsorshipCategory[]>("/sponsorship/categories");
  return data;
}

export async function listSponsorshipPackages(): Promise<SponsorshipPackage[]> {
  const { data } = await apiClient.get<SponsorshipPackage[]>("/sponsorship/packages");
  return data;
}

export async function listSponsorshipInquiries(eventId?: string): Promise<SponsorshipInquiry[]> {
  const { data } = await apiClient.get<SponsorshipInquiry[]>("/sponsorship/inquiries", {
    params: eventId ? { event_id: eventId } : undefined,
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
