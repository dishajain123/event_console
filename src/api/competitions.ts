import { apiClient } from "@/api/client";
import type { CompetitionMatchOut, CompetitionOut, CompetitionStageOut, StandingOut } from "@/types/competitions";

export type CompetitionPage = { items: CompetitionOut[]; total: number; page: number; page_size: number };
export type MatchPage = { items: CompetitionMatchOut[]; total: number; page: number; page_size: number };
export async function listCompetitions(eventId: string, page = 1): Promise<CompetitionPage> { const { data } = await apiClient.get<CompetitionPage>("/competitions", { params: { event_id: eventId, page, page_size: 25 } }); return data; }
export async function createCompetition(eventId: string, payload: { name: string; competition_type: string; participation_mode: string }): Promise<CompetitionOut> { const { data } = await apiClient.post<CompetitionOut>(`/events/${eventId}/competitions`, payload); return data; }
export async function listCompetitionStages(id: string): Promise<CompetitionStageOut[]> { const { data } = await apiClient.get<CompetitionStageOut[]>(`/competitions/${id}/stages`); return data; }
export async function createCompetitionStage(eventId: string, payload: { competition_id: string; name: string; stage_type: string; order_index: number }): Promise<CompetitionStageOut> { const { data } = await apiClient.post<CompetitionStageOut>(`/events/${eventId}/stages`, payload); return data; }
export async function listCompetitionMatches(id: string): Promise<MatchPage> { const { data } = await apiClient.get<MatchPage>(`/competitions/${id}/matches`, { params: { page: 1, page_size: 25 } }); return data; }
export async function createCompetitionMatch(id: string, payload: { stage_id: string; round_number: number; match_number: number; entry_a_id?: string; entry_b_id?: string; scheduled_start: string; scheduled_end: string; title?: string }): Promise<CompetitionMatchOut> { const { data } = await apiClient.post<CompetitionMatchOut>(`/competitions/${id}/matches`, payload); return data; }
export async function recordCompetitionResult(id: string, payload: { score_a?: number; score_b?: number; result_status: string; winner_entry_id?: string; notes?: string }): Promise<CompetitionMatchOut> { const { data } = await apiClient.post<CompetitionMatchOut>(`/matches/${id}/result`, payload); return data; }
export async function getStandings(id: string): Promise<StandingOut[]> { const { data } = await apiClient.get<StandingOut[]>(`/competitions/${id}/standings`); return data; }
