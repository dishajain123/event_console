"use client";

import { use, useState } from "react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useCompetitionDetails, useCreateCompetition, useCreateCompetitionMatch, useCreateCompetitionStage, useEventCompetitions, useRecordCompetitionResult } from "@/hooks/useCompetitions";

export default function CompetitionsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [name, setName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stageName, setStageName] = useState("");
  const [stageId, setStageId] = useState("");
  const [matchStart, setMatchStart] = useState("");
  const [matchEnd, setMatchEnd] = useState("");
  const [resultMatchId, setResultMatchId] = useState("");
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [winnerId, setWinnerId] = useState("");
  const competitions = useEventCompetitions(eventId);
  const create = useCreateCompetition(eventId);
  const selected = competitions.data?.items.find((item) => item.id === selectedId) ?? competitions.data?.items[0];
  const details = useCompetitionDetails(selected?.id ?? "");
  const createStage = useCreateCompetitionStage(eventId, selected?.id ?? "");
  const createMatch = useCreateCompetitionMatch(selected?.id ?? "");
  const recordResult = useRecordCompetitionResult(selected?.id ?? "");

  return <div className="space-y-5">
    <Header title="Competitions" />
    <GlassPanel><div className="flex flex-wrap gap-2"><Input placeholder="Competition name" value={name} onChange={(event) => setName(event.target.value)} /><Button disabled={!name.trim() || create.isPending} onClick={() => { create.mutate({ name: name.trim(), competition_type: "custom", participation_mode: "individual" }); setName(""); }}>Create competition</Button></div></GlassPanel>
    <GlassPanel padded={false}>{competitions.isLoading ? <p className="p-6">Loading competitions...</p> : competitions.isError ? <div className="p-6"><ErrorState onRetry={() => competitions.refetch()} /></div> : !competitions.data?.items.length ? <div className="p-6"><EmptyState title="No competitions" description="Create a competition for this event." /></div> : <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs"><th className="p-4">Name</th><th className="p-4">Type</th><th className="p-4">Mode</th><th className="p-4">Status</th></tr></thead><tbody>{competitions.data.items.map((competition) => <tr key={competition.id} className={`cursor-pointer border-b ${selected?.id === competition.id ? "bg-slate-50" : ""}`} onClick={() => setSelectedId(competition.id)}><td className="p-4 font-medium">{competition.name}</td><td className="p-4">{competition.competition_type}</td><td className="p-4">{competition.participation_mode}</td><td className="p-4 capitalize">{competition.status.replaceAll("_", " ")}</td></tr>)}</tbody></table>}</GlassPanel>
    {selected && <div className="grid gap-5 lg:grid-cols-3">
      <GlassPanel><h2 className="mb-3 font-semibold">Stages</h2><div className="mb-3 flex gap-2"><Input placeholder="Stage name" value={stageName} onChange={(event) => setStageName(event.target.value)} /><Button disabled={!stageName.trim() || createStage.isPending} onClick={() => { createStage.mutate({ name: stageName.trim(), stage_type: "group", order_index: (details.stages.data?.length ?? 0) + 1 }); setStageName(""); }}>Add</Button></div>{details.stages.isLoading ? <p>Loading...</p> : details.stages.isError ? <ErrorState onRetry={() => details.stages.refetch()} /> : details.stages.data?.length ? <ul className="space-y-2 text-sm">{details.stages.data.map((stage) => <li key={stage.id} className="rounded border p-2">{stage.order_index}. {stage.name} <span className="text-slate-500">({stage.stage_type})</span></li>)}</ul> : <p className="text-sm text-slate-500">No stages configured.</p>}</GlassPanel>
      <GlassPanel><h2 className="mb-3 font-semibold">Fixtures</h2><div className="mb-3 grid gap-2"><Input placeholder="Stage ID" value={stageId} onChange={(event) => setStageId(event.target.value)} /><Input type="datetime-local" value={matchStart} onChange={(event) => setMatchStart(event.target.value)} /><Input type="datetime-local" value={matchEnd} onChange={(event) => setMatchEnd(event.target.value)} /><Button disabled={!stageId || !matchStart || !matchEnd || createMatch.isPending} onClick={() => createMatch.mutate({ stage_id: stageId, round_number: 1, match_number: (details.matches.data?.total ?? 0) + 1, scheduled_start: new Date(matchStart).toISOString(), scheduled_end: new Date(matchEnd).toISOString() })}>Schedule fixture</Button></div>{details.matches.isLoading ? <p>Loading...</p> : details.matches.isError ? <ErrorState onRetry={() => details.matches.refetch()} /> : details.matches.data?.items.length ? <ul className="space-y-2 text-sm">{details.matches.data.items.map((match) => <li key={match.id} className="rounded border p-2">Round {match.round_number}, match {match.match_number}<br /><span className="text-slate-500">{match.status} | {match.score_a ?? "-"} : {match.score_b ?? "-"}</span>{match.status !== "completed" && <Button className="mt-2" onClick={() => setResultMatchId(match.id)}>Record result</Button>}</li>)}</ul> : <p className="text-sm text-slate-500">No fixtures scheduled.</p>}{resultMatchId && <div className="mt-3 grid gap-2"><Input placeholder="Score A" type="number" value={scoreA} onChange={(event) => setScoreA(event.target.value)} /><Input placeholder="Score B" type="number" value={scoreB} onChange={(event) => setScoreB(event.target.value)} /><Input placeholder="Winner entry ID (optional for draw)" value={winnerId} onChange={(event) => setWinnerId(event.target.value)} /><Button disabled={recordResult.isPending} onClick={() => { recordResult.mutate({ matchId: resultMatchId, payload: { score_a: Number(scoreA), score_b: Number(scoreB), result_status: winnerId ? "win" : "draw", ...(winnerId ? { winner_entry_id: winnerId } : {}) } }); setResultMatchId(""); }}>Save result</Button></div>}</GlassPanel>
      <GlassPanel><h2 className="mb-3 font-semibold">Standings</h2>{details.standings.isLoading ? <p>Loading...</p> : details.standings.isError ? <ErrorState onRetry={() => details.standings.refetch()} /> : details.standings.data?.length ? <ul className="space-y-2 text-sm">{details.standings.data.map((row) => <li key={row.entry_id} className="flex justify-between rounded border p-2"><span>#{row.position} {row.entry_id.slice(0, 8)}</span><strong>{row.points} pts</strong></li>)}</ul> : <p className="text-sm text-slate-500">Standings appear after results.</p>}</GlassPanel>
    </div>}
  </div>;
}
