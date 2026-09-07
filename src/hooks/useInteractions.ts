import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { answerQuestion, changePollStatus, getInteractionMetrics, listPolls, listQuestions, moderateQuestion } from "@/api/interactions";
import type { QuestionStatus } from "@/types/interactions";
import { useSessionStore } from "@/state/sessionStore";

const ready = () => { const s = useSessionStore.getState(); return s.hydrated && !!s.user; };
export function useInteractions(eventId: string) {
  const client = useQueryClient();
  const polls = useQuery({ queryKey: ["interactions", eventId, "polls"], queryFn: () => listPolls(eventId), enabled: ready() && !!eventId });
  const questions = useQuery({ queryKey: ["interactions", eventId, "questions"], queryFn: () => listQuestions(eventId), enabled: ready() && !!eventId });
  const metrics = useQuery({ queryKey: ["interactions", eventId, "metrics"], queryFn: () => getInteractionMetrics(eventId), enabled: ready() && !!eventId });
  const status = useMutation({ mutationFn: ({ id, value }: { id: string; value: string }) => changePollStatus(id, value), onSuccess: () => client.invalidateQueries({ queryKey: ["interactions", eventId] }) });
  const moderate = useMutation({ mutationFn: ({ id, value }: { id: string; value: QuestionStatus }) => moderateQuestion(id, value), onSuccess: () => client.invalidateQueries({ queryKey: ["interactions", eventId, "questions"] }) });
  const answer = useMutation({ mutationFn: ({ id, value }: { id: string; value: string }) => answerQuestion(id, value), onSuccess: () => client.invalidateQueries({ queryKey: ["interactions", eventId, "questions"] }) });
  return { polls, questions, metrics, status, moderate, answer };
}
