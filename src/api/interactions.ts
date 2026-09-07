import { apiClient } from "@/api/client";
import type { InteractionMetrics, Page, Poll, Question, QuestionStatus } from "@/types/interactions";

export const listPolls = async (eventId: string, page = 1) => (await apiClient.get<Page<Poll>>(`/interactions/events/${eventId}/polls`, { params: { page, page_size: 25 } })).data;
export const createPoll = async (eventId: string, payload: Omit<Poll, "id" | "event_id" | "status" | "options"> & { options: { label: string }[] }) => (await apiClient.post<Poll>(`/interactions/events/${eventId}/polls`, payload)).data;
export const changePollStatus = async (pollId: string, status: string) => (await apiClient.post<Poll>(`/interactions/polls/${pollId}/status`, { status })).data;
export const listQuestions = async (eventId: string, page = 1, status?: QuestionStatus, search?: string) => (await apiClient.get<Page<Question>>(`/interactions/events/${eventId}/questions/manage`, { params: { page, page_size: 25, status, search } })).data;
export const moderateQuestion = async (id: string, status: QuestionStatus) => (await apiClient.post<Question>(`/interactions/questions/${id}/moderate`, { status })).data;
export const answerQuestion = async (id: string, answer_text: string) => (await apiClient.post<Question>(`/interactions/questions/${id}/answer`, { answer_text })).data;
export const getInteractionMetrics = async (eventId: string) => (await apiClient.get<InteractionMetrics>(`/interactions/events/${eventId}/metrics`)).data;
