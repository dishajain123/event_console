import { useQuery } from "@tanstack/react-query";
import { getFeedbackSummary, listFeedback, listFeedbackCategories, type FeedbackFilters } from "@/api/feedback";
import { useSessionStore } from "@/state/sessionStore";

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useFeedback(filters: FeedbackFilters = {}) {
  const ready = useReady();
  return useQuery({
    queryKey: ["feedback", filters],
    queryFn: () => listFeedback(filters),
    enabled: ready,
  });
}

export function useFeedbackSummary(filters: FeedbackFilters = {}) {
  const ready = useReady();
  return useQuery({
    queryKey: ["feedback", "summary", filters],
    queryFn: () => getFeedbackSummary(filters),
    enabled: ready,
  });
}

export function useFeedbackCategories() {
  const ready = useReady();
  return useQuery({
    queryKey: ["feedback", "categories"],
    queryFn: listFeedbackCategories,
    enabled: ready,
  });
}
