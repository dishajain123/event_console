"use client";

import { useState } from "react";
import { MessageSquare, Star, Users } from "lucide-react";
import { useFeedback, useFeedbackCategories, useFeedbackSummary } from "@/hooks/useFeedback";
import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from "@/types/feedback";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { KPICard } from "@/components/reports/kpi-card";
import { CardSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";

export function FeedbackWorkspace({ eventId }: { eventId?: string }) {
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [rating, setRating] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const filters = {
    eventId,
    category: category || undefined,
    rating: rating ? Number(rating) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit: 100,
  };
  const feedback = useFeedback(filters);
  const summary = useFeedbackSummary(filters);
  const categories = useFeedbackCategories();

  return (
    <div>
      <Header title={eventId ? "Event Feedback" : "Feedback Overview"} />
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.isLoading ? (
          <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
        ) : summary.isError || !summary.data ? (
          <div className="sm:col-span-3"><ErrorState description="Couldn't load feedback summary." onRetry={() => summary.refetch()} /></div>
        ) : (
          <>
            <KPICard label="Responses" value={summary.data.response_count} icon={Users} tone="accent" />
            <KPICard label="Overall rating" value={summary.data.overall_rating ?? "—"} icon={Star} tone="success" />
            <KPICard label="Categories represented" value={summary.data.category_summaries.length} icon={MessageSquare} tone="info" />
          </>
        )}
      </div>

      <GlassPanel className="mb-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Select value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory | "")}>
            <option value="">All categories</option>
            {(categories.data ?? []).map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
          </Select>
          <Select value={rating} onChange={(event) => setRating(event.target.value)}>
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
          </Select>
          <Input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="From date" />
          <Input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="To date" />
        </div>
      </GlassPanel>

      {feedback.isLoading ? <CardSkeleton /> : feedback.isError ? (
        <ErrorState description="Couldn't load feedback." onRetry={() => feedback.refetch()} />
      ) : !feedback.data?.length ? (
        <EmptyState icon={MessageSquare} title="No feedback found" description="Feedback will appear here once participants submit it." />
      ) : (
        <GlassPanel padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-black/[0.06] text-left text-xs text-[var(--foreground-muted)]">
                <th className="px-6 py-3 font-medium">Event</th><th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Rating</th><th className="px-6 py-3 font-medium">Comment</th>
                <th className="px-6 py-3 font-medium">Submitted</th>
              </tr></thead>
              <tbody className="divide-y divide-black/[0.05]">
                {feedback.data.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 font-medium text-[var(--foreground)]">{row.event_name ?? row.event_id}</td>
                    <td className="px-6 py-4 text-[var(--foreground-muted)]">{row.category_label ?? FEEDBACK_CATEGORY_LABELS[row.category] ?? row.category}</td>
                    <td className="px-6 py-4 text-[var(--foreground-muted)]">{row.rating}/5</td>
                    <td className="max-w-md px-6 py-4 text-[var(--foreground-muted)]">{row.comment ?? "—"}</td>
                    <td className="px-6 py-4 text-[var(--foreground-muted)]">{new Date(row.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
