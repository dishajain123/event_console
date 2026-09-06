import { apiClient } from "@/api/client";
import type { FeedbackCategory, FeedbackCategoryOut, FeedbackOut, FeedbackSummaryOut } from "@/types/feedback";

export interface FeedbackFilters {
  eventId?: string;
  category?: FeedbackCategory;
  rating?: number;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export async function listFeedbackCategories(): Promise<FeedbackCategoryOut[]> {
  const { data } = await apiClient.get<FeedbackCategoryOut[]>("/feedback/categories");
  return data;
}

function params(filters: FeedbackFilters) {
  return {
    event_id: filters.eventId,
    category: filters.category,
    rating: filters.rating,
    date_from: filters.dateFrom ? `${filters.dateFrom}T00:00:00Z` : undefined,
    date_to: filters.dateTo ? `${filters.dateTo}T23:59:59Z` : undefined,
    limit: filters.limit,
    offset: filters.offset,
  };
}

export async function listFeedback(filters: FeedbackFilters = {}): Promise<FeedbackOut[]> {
  const { data } = await apiClient.get<FeedbackOut[]>("/feedback", { params: params(filters) });
  return data;
}

export async function getFeedbackSummary(filters: FeedbackFilters = {}): Promise<FeedbackSummaryOut> {
  const { data } = await apiClient.get<FeedbackSummaryOut>("/feedback/summary", { params: params(filters) });
  return data;
}
