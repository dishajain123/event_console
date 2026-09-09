"use client";

import { useState } from "react";
import { MessageSquare, Star, Users } from "lucide-react";
import { useFeedback, useFeedbackCategories, useFeedbackSummary } from "@/hooks/useFeedback";
import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from "@/types/feedback";
import { Header } from "@/components/layout/header";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { KPICard } from "@/components/reports/kpi-card";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { CardSkeleton } from "@/components/shared/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";

/** Same `useFeedback`/`useFeedbackSummary`/`useFeedbackCategories` hooks and filter shape as before. */
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
  const isFiltered = !!(category || rating || dateFrom || dateTo);

  return (
    <div>
      <Header title={eventId ? "Event Feedback" : "Feedback Overview"} />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summary.isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : summary.isError || !summary.data ? (
          <div className="sm:col-span-3">
            <ErrorState description="Couldn't load feedback summary." onRetry={() => summary.refetch()} />
          </div>
        ) : (
          <>
            <KPICard label="Responses" value={summary.data.response_count} icon={Users} tone="accent" />
            <KPICard label="Overall rating" value={summary.data.overall_rating ?? "—"} icon={Star} tone="success" />
            <KPICard label="Categories represented" value={summary.data.category_summaries.length} icon={MessageSquare} tone="info" />
          </>
        )}
      </div>

      <FilterBar
        isFiltered={isFiltered}
        onReset={() => {
          setCategory("");
          setRating("");
          setDateFrom("");
          setDateTo("");
        }}
      >
        <Select className="w-48" value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory | "")}>
          <option value="">All categories</option>
          {(categories.data ?? []).map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </Select>
        <Select className="w-36" value={rating} onChange={(event) => setRating(event.target.value)}>
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </Select>
        <Input type="date" className="w-40" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} aria-label="From date" />
        <Input type="date" className="w-40" value={dateTo} onChange={(event) => setDateTo(event.target.value)} aria-label="To date" />
      </FilterBar>

      {feedback.isLoading ? (
        <CardSkeleton />
      ) : feedback.isError ? (
        <ErrorState description="Couldn't load feedback." onRetry={() => feedback.refetch()} />
      ) : !feedback.data?.length ? (
        <EmptyState icon={MessageSquare} title="No feedback found" description="Feedback will appear here once participants submit it." />
      ) : (
        <GlassPanel padded={false}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Event</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>Rating</TableHeaderCell>
                  <TableHeaderCell>Comment</TableHeaderCell>
                  <TableHeaderCell>Submitted</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedback.data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-[var(--foreground)]">{row.event_name ?? row.event_id}</TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">
                      {row.category_label ?? FEEDBACK_CATEGORY_LABELS[row.category] ?? row.category}
                    </TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">{row.rating}/5</TableCell>
                    <TableCell className="max-w-md text-[var(--foreground-muted)]">{row.comment ?? "—"}</TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </GlassPanel>
      )}
    </div>
  );
}