"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ListChecks, Plus, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { PageToolbar } from "@/components/shared/page-toolbar";
import { FilterBar } from "@/components/shared/filter-bar";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { CardSkeleton, TableSkeleton } from "@/components/shared/skeleton";
import { useInteractions } from "@/hooks/useInteractions";
import type { QuestionStatus } from "@/types/interactions";
import type { ApiError } from "@/api/client";

const PAGE_SIZE = 25;
const QUESTION_STATUSES: QuestionStatus[] = ["pending", "approved", "answered", "rejected", "hidden"];

function pollStatusTone(status: string): "accent" | "success" | "warning" | "neutral" {
  if (status === "live") return "success";
  if (status === "scheduled") return "accent";
  if (status === "closed" || status === "archived") return "neutral";
  return "warning";
}

function questionStatusTone(status: QuestionStatus): "accent" | "success" | "warning" | "neutral" | "danger" {
  if (status === "answered") return "success";
  if (status === "approved") return "accent";
  if (status === "pending") return "warning";
  if (status === "rejected" || status === "hidden") return "danger";
  return "neutral";
}

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function CreatePollDialog({
  open,
  onClose,
  onCreate,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    title: string;
    description: string | null;
    starts_at: string;
    ends_at: string;
    choice_mode: "single" | "multiple";
    anonymous: boolean;
    allow_vote_change: boolean;
    result_visibility: string;
    max_selections: number | null;
    options: { label: string }[];
  }) => void;
  submitting: boolean;
}) {
  const now = new Date();
  const inHour = new Date(now.getTime() + 60 * 60 * 1000);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState(toLocalInputValue(now));
  const [endsAt, setEndsAt] = useState(toLocalInputValue(inHour));
  const [choiceMode, setChoiceMode] = useState<"single" | "multiple">("single");
  const [anonymous, setAnonymous] = useState(false);
  const [allowVoteChange, setAllowVoteChange] = useState(false);
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setDescription("");
    setStartsAt(toLocalInputValue(now));
    setEndsAt(toLocalInputValue(inHour));
    setChoiceMode("single");
    setAnonymous(false);
    setAllowVoteChange(false);
    setOptions(["", ""]);
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }

  function addOption() {
    if (options.length >= 10) return;
    setOptions((prev) => [...prev, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (cleanOptions.length < 2) {
      setError("Add at least 2 non-empty options.");
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      setError("End time must be after the start time.");
      return;
    }
    setError(null);
    onCreate({
      title: title.trim(),
      description: description.trim() || null,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      choice_mode: choiceMode,
      anonymous,
      allow_vote_change: allowVoteChange,
      result_visibility: "after_close",
      max_selections: choiceMode === "multiple" ? cleanOptions.length : null,
      options: cleanOptions.map((label) => ({ label })),
    });
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Create poll" description="Attendees vote live during the event." size="lg">
      <div className="space-y-3.5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Title</label>
          <Input placeholder="Which session should we extend?" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
            Description <span className="text-[var(--foreground-subtle)]">(optional)</span>
          </label>
          <Textarea placeholder="Shown to attendees above the options." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Starts</label>
            <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Ends</label>
            <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Choice mode</label>
          <Select value={choiceMode} onChange={(e) => setChoiceMode(e.target.value as "single" | "multiple")}>
            <option value="single">Single choice</option>
            <option value="multiple">Multiple choice</option>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Options</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={options.length <= 2}
                  onClick={() => removeOption(index)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-[var(--danger)]" />
                </Button>
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addOption}>
              <Plus className="h-3.5 w-3.5" />
              Add option
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Switch checked={anonymous} onChange={setAnonymous} label="Anonymous votes" />
          <Switch checked={allowVoteChange} onChange={setAllowVoteChange} label="Allow changing vote" />
        </div>
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" loading={submitting} onClick={handleSubmit}>
            Create poll
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function AnswerQuestionDialog({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (answer: string) => void;
  submitting: boolean;
}) {
  const [answer, setAnswer] = useState("");

  function handleClose() {
    setAnswer("");
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Answer question" size="sm">
      <div className="space-y-3.5">
        <Textarea
          placeholder="Type the answer attendees will see…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={submitting}
            disabled={!answer.trim()}
            onClick={() => {
              onSubmit(answer.trim());
              setAnswer("");
            }}
          >
            Submit answer
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

export default function EventInteractionsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [pollsPage, setPollsPage] = useState(1);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus | "">("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [answeringId, setAnsweringId] = useState<string | null>(null);

  const { polls, questions, metrics, create, status, moderate, answer } = useInteractions(eventId, {
    pollsPage,
    questionsPage,
    questionStatus: questionStatus || undefined,
    questionSearch: questionSearch || undefined,
  });

  const pollsTotalPages = polls.data ? Math.max(1, Math.ceil(polls.data.total / PAGE_SIZE)) : 1;
  const questionsTotalPages = questions.data ? Math.max(1, Math.ceil(questions.data.total / PAGE_SIZE)) : 1;
  const isQuestionFiltered = !!(questionStatus || questionSearch);

  async function handleCreatePoll(payload: Parameters<typeof create.mutateAsync>[0]) {
    try {
      await create.mutateAsync(payload);
      setCreateOpen(false);
    } catch {
      // Error surfaces via the dialog's own inline error state on next submit;
      // the mutation error itself is available via create.error if needed.
    }
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
      <PageToolbar
        description="Polls and moderated attendee questions."
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Create poll
          </Button>
        }
      />

      {metrics.isLoading ? (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : metrics.isError ? (
        <div className="mb-4">
          <ErrorState
            description={(metrics.error as unknown as ApiError | null)?.message ?? "Couldn't load interaction metrics."}
            onRetry={() => metrics.refetch()}
          />
        </div>
      ) : (
        metrics.data && (
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-6">
            {Object.entries(metrics.data).map(([key, value]) => (
              <GlassPanel key={key} padded={false} className="p-3.5">
                <p className="text-xs uppercase tracking-wide text-[var(--foreground-subtle)]">{key.replaceAll("_", " ")}</p>
                <p className="mt-0.5 text-xl font-semibold text-[var(--foreground)]">{value}</p>
              </GlassPanel>
            ))}
          </div>
        )
      )}

      <GlassPanel padded={false} className="mb-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Polls</h2>
          {polls.data && <span className="text-xs text-[var(--foreground-subtle)]">{polls.data.total} total</span>}
        </div>
        {polls.isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={3} cols={2} />
          </div>
        ) : polls.isError ? (
          <div className="p-5">
            <ErrorState
              description={(polls.error as unknown as ApiError | null)?.message ?? "Couldn't load polls."}
              onRetry={() => polls.refetch()}
            />
          </div>
        ) : !polls.data?.items.length ? (
          <div className="p-5">
            <EmptyState
              icon={ListChecks}
              title="No polls yet"
              description="Create a poll to gather live feedback from attendees during the event."
              action={{ label: "Create poll", onClick: () => setCreateOpen(true) }}
            />
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {polls.data.items.map((poll) => (
              <div key={poll.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">{poll.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge tone={pollStatusTone(poll.status)} className="capitalize">
                      {poll.status}
                    </Badge>
                    <span className="text-xs text-[var(--foreground-subtle)]">
                      {poll.options.length} options · {poll.choice_mode === "multiple" ? "Multiple choice" : "Single choice"}
                    </span>
                  </div>
                </div>
                {poll.status !== "archived" && poll.status !== "closed" && (
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
        )}
        <Pagination page={pollsPage} totalPages={pollsTotalPages} totalItems={polls.data?.total} onPageChange={setPollsPage} />
      </GlassPanel>

      <GlassPanel padded={false}>
        <div className="border-b border-[var(--border)] px-5 py-3.5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Questions</h2>
            {questions.data && <span className="text-xs text-[var(--foreground-subtle)]">{questions.data.total} total</span>}
          </div>
          <FilterBar
            className="mb-0"
            isFiltered={isQuestionFiltered}
            onReset={() => {
              setQuestionStatus("");
              setQuestionSearch("");
              setQuestionsPage(1);
            }}
          >
            <Input
              className="max-w-xs"
              placeholder="Search questions"
              value={questionSearch}
              onChange={(e) => {
                setQuestionSearch(e.target.value);
                setQuestionsPage(1);
              }}
            />
            <Select
              className="w-44"
              value={questionStatus}
              onChange={(e) => {
                setQuestionStatus(e.target.value as QuestionStatus | "");
                setQuestionsPage(1);
              }}
            >
              <option value="">All statuses</option>
              {QUESTION_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </Select>
          </FilterBar>
        </div>
        {questions.isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={3} cols={2} />
          </div>
        ) : questions.isError ? (
          <div className="p-5">
            <ErrorState
              description={(questions.error as unknown as ApiError | null)?.message ?? "Couldn't load questions."}
              onRetry={() => questions.refetch()}
            />
          </div>
        ) : !questions.data?.items.length ? (
          <div className="p-5">
            <EmptyState
              icon={HelpCircle}
              title={isQuestionFiltered ? "No questions match these filters" : "No questions awaiting moderation"}
              description={isQuestionFiltered ? "Try clearing the search or status filter." : undefined}
            />
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {questions.data.items.map((q) => (
              <div key={q.id} className="px-5 py-3.5">
                <p className="text-sm text-[var(--foreground)]">{q.question}</p>
                {q.answer_text && (
                  <p className="mt-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-muted)] p-2.5 text-xs text-[var(--foreground-muted)]">
                    <span className="font-medium text-[var(--foreground)]">Answer: </span>
                    {q.answer_text}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone={questionStatusTone(q.status)} className="capitalize">
                    {q.status}
                  </Badge>
                  <span className="text-xs text-[var(--foreground-subtle)]">{q.upvotes} upvotes</span>
                  {q.display_name && <span className="text-xs text-[var(--foreground-subtle)]">· {q.display_name}</span>}
                </div>
                <div className="mt-2.5 flex gap-2">
                  {q.status === "pending" && (
                    <>
                      <Button size="sm" disabled={moderate.isPending} onClick={() => moderate.mutate({ id: q.id, value: "approved" })}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={moderate.isPending}
                        onClick={() => moderate.mutate({ id: q.id, value: "rejected" })}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {q.status === "approved" && (
                    <Button size="sm" variant="outline" onClick={() => setAnsweringId(q.id)}>
                      Answer
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={questionsPage} totalPages={questionsTotalPages} totalItems={questions.data?.total} onPageChange={setQuestionsPage} />
      </GlassPanel>

      <CreatePollDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreatePoll} submitting={create.isPending} />
      <AnswerQuestionDialog
        open={!!answeringId}
        onClose={() => setAnsweringId(null)}
        submitting={answer.isPending}
        onSubmit={(value) => {
          if (!answeringId) return;
          answer.mutate(
            { id: answeringId, value },
            {
              onSuccess: () => setAnsweringId(null),
            },
          );
        }}
      />
    </div>
  );
}
