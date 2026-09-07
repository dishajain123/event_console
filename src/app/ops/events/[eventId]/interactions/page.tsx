"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useInteractions } from "@/hooks/useInteractions";

export default function EventInteractionsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params); const { polls, questions, metrics, status, moderate, answer } = useInteractions(eventId);
  if (polls.isLoading || questions.isLoading || metrics.isLoading) return <p className="p-6">Loading interactions...</p>;
  if (polls.isError || questions.isError || metrics.isError) return <p className="p-6 text-red-500">Unable to load event interactions.</p>;
  return <div className="space-y-6"><Link href={`/ops/events/${eventId}`} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]"><ArrowLeft className="h-4 w-4" /> Back to event</Link>
    <header><h1 className="text-2xl font-semibold">Live interactions</h1><p className="text-sm text-[var(--foreground-muted)]">Polls and moderated attendee questions</p></header>
    {metrics.data && <div className="grid grid-cols-2 gap-3 md:grid-cols-6">{Object.entries(metrics.data).map(([key, value]) => <div key={key} className="rounded-xl border p-3"><p className="text-xs uppercase text-[var(--foreground-muted)]">{key.replaceAll("_", " ")}</p><p className="text-2xl font-semibold">{value}</p></div>)}</div>}
    <section className="rounded-xl border p-4"><h2 className="mb-3 text-lg font-semibold">Polls</h2>{polls.data?.items.length ? <div className="space-y-3">{polls.data.items.map((poll) => <div key={poll.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{poll.title}</p><p className="text-xs text-[var(--foreground-muted)]">{poll.status} · {poll.options.length} options</p></div>{poll.status !== "archived" && <button className="rounded-md border px-3 py-1 text-sm" disabled={status.isPending} onClick={() => status.mutate({ id: poll.id, value: poll.status === "draft" ? "scheduled" : poll.status === "scheduled" ? "live" : "closed" })}>{poll.status === "draft" ? "Schedule" : poll.status === "scheduled" ? "Open" : "Close"}</button>}</div>)}</div> : <p className="text-sm text-[var(--foreground-muted)]">No polls configured.</p>}</section>
    <section className="rounded-xl border p-4"><h2 className="mb-3 text-lg font-semibold">Questions</h2>{questions.data?.items.length ? <div className="space-y-3">{questions.data.items.map((q) => <div key={q.id} className="rounded-lg border p-3"><p>{q.question}</p><p className="mt-1 text-xs text-[var(--foreground-muted)]">{q.status} · {q.upvotes} upvotes</p><div className="mt-3 flex gap-2">{q.status === "pending" && <><button className="rounded-md bg-green-600 px-3 py-1 text-sm text-white" onClick={() => moderate.mutate({ id: q.id, value: "approved" })}>Approve</button><button className="rounded-md border px-3 py-1 text-sm" onClick={() => moderate.mutate({ id: q.id, value: "rejected" })}>Reject</button></>}{q.status === "approved" && <button className="rounded-md border px-3 py-1 text-sm" onClick={() => { const value = window.prompt("Answer"); if (value) answer.mutate({ id: q.id, value }); }}>Answer</button>}</div></div>)}</div> : <p className="text-sm text-[var(--foreground-muted)]">No questions awaiting moderation.</p>}</section>
  </div>;
}
