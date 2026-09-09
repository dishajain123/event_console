"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/states";
import { useInteractions } from "@/hooks/useInteractions";

/** Same `useInteractions` hook and mutation payloads as before. */
export default function EventInteractionsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { polls, questions, metrics, status, moderate, answer } = useInteractions(eventId);

  if (polls.isLoading || questions.isLoading || metrics.isLoading) {
    return <p className="p-5 text-sm text-[var(--foreground-muted)]">Loading interactions…</p>;
  }
  if (polls.isError || questions.isError || metrics.isError) {
    return (
      <div className="p-5">
        <ErrorState title="Unable to load event interactions" />
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/ops/events/${eventId}`}
        className="mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to event
      </Link>
      <Header title="Live Interactions" />
      <p className="mb-4 -mt-2 text-sm text-[var(--foreground-muted)]">Polls and moderated attendee questions.</p>

      {metrics.data && (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-6">
          {Object.entries(metrics.data).map(([key, value]) => (
            <GlassPanel key={key} padded={false} className="p-3.5">
              <p className="text-xs uppercase tracking-wide text-[var(--foreground-subtle)]">{key.replaceAll("_", " ")}</p>
              <p className="mt-0.5 text-xl font-semibold text-[var(--foreground)]">{value}</p>
            </GlassPanel>
          ))}
        </div>
      )}

      <GlassPanel className="mb-4">
        <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Polls</h2>
        {polls.data?.items.length ? (
          <div className="space-y-2">
            {polls.data.items.map((poll) => (
              <div key={poll.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{poll.title}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{poll.status} · {poll.options.length} options</p>
                </div>
                {poll.status !== "archived" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={status.isPending}
                    onClick={() =>
                      status.mutate({
                        id: poll.id,
                        value: poll.status === "draft" ? "scheduled" : poll.status === "scheduled" ? "live" : "closed",
                      })
                    }
                  >
                    {poll.status === "draft" ? "Schedule" : poll.status === "scheduled" ? "Open" : "Close"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--foreground-muted)]">No polls configured.</p>
        )}
      </GlassPanel>

      <GlassPanel>
        <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Questions</h2>
        {questions.data?.items.length ? (
          <div className="space-y-2">
            {questions.data.items.map((q) => (
              <div key={q.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
                <p className="text-sm text-[var(--foreground)]">{q.question}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="neutral" className="capitalize">{q.status}</Badge>
                  <span className="text-xs text-[var(--foreground-subtle)]">{q.upvotes} upvotes</span>
                </div>
                <div className="mt-2.5 flex gap-2">
                  {q.status === "pending" && (
                    <>
                      <Button size="sm" onClick={() => moderate.mutate({ id: q.id, value: "approved" })}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => moderate.mutate({ id: q.id, value: "rejected" })}>Reject</Button>
                    </>
                  )}
                  {q.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const value = window.prompt("Answer");
                        if (value) answer.mutate({ id: q.id, value });
                      }}
                    >
                      Answer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--foreground-muted)]">No questions awaiting moderation.</p>
        )}
      </GlassPanel>
    </div>
  );
}