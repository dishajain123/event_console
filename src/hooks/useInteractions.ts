import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { answerQuestion, changePollStatus, createPoll, getInteractionMetrics, listPolls, listQuestions, moderateQuestion } from "@/api/interactions";
import type { Poll, QuestionStatus } from "@/types/interactions";
import { useSessionStore } from "@/state/sessionStore";

const ready = () => { const s = useSessionStore.getState(); return s.hydrated && !!s.user; };

export function useInteractions(
  eventId: string,
  options: { pollsPage?: number; questionsPage?: number; questionStatus?: QuestionStatus; questionSearch?: string } = {},
) {
  const client = useQueryClient();
  const pollsPage = options.pollsPage ?? 1;
  const questionsPage = options.questionsPage ?? 1;
  const polls = useQuery({
    queryKey: ["interactions", eventId, "polls", pollsPage],
    queryFn: () => listPolls(eventId, pollsPage),
    enabled: ready() && !!eventId,
  });
  const questions = useQuery({
    queryKey: ["interactions", eventId, "questions", questionsPage, options.questionStatus, options.questionSearch],
    queryFn: () => listQuestions(eventId, questionsPage, options.questionStatus, options.questionSearch),
    enabled: ready() && !!eventId,
  });
  const metrics = useQuery({ queryKey: ["interactions", eventId, "metrics"], queryFn: () => getInteractionMetrics(eventId), enabled: ready() && !!eventId });
  const create = useMutation({
    mutationFn: (payload: Omit<Poll, "id" | "event_id" | "status" | "options"> & { options: { label: string }[] }) => createPoll(eventId, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["interactions", eventId, "polls"] }),
  });
  const status = useMutation({ mutationFn: ({ id, value }: { id: string; value: string }) => changePollStatus(id, value), onSuccess: () => client.invalidateQueries({ queryKey: ["interactions", eventId, "polls"] }) });
  const moderate = useMutation({ mutationFn: ({ id, value }: { id: string; value: QuestionStatus }) => moderateQuestion(id, value), onSuccess: () => client.invalidateQueries({ queryKey: ["interactions", eventId, "questions"] }) });
  const answer = useMutation({ mutationFn: ({ id, value }: { id: string; value: string }) => answerQuestion(id, value), onSuccess: () => client.invalidateQueries({ queryKey: ["interactions", eventId, "questions"] }) });
  return { polls, questions, metrics, create, status, moderate, answer };
}
