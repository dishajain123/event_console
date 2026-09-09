"use client";

import { use, useState } from "react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, TableContainer } from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/shared/states";
import {
  useCompetitionDetails,
  useCreateCompetition,
  useCreateCompetitionMatch,
  useCreateCompetitionStage,
  useEventCompetitions,
  useRecordCompetitionResult,
} from "@/hooks/useCompetitions";

/** Same competition/stage/match/result hooks and mutation payloads as before. */
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

  return (
    <div>
      <Header title="Competitions" />

      <GlassPanel className="mb-4">
        <div className="flex flex-wrap gap-2">
          <Input className="max-w-xs" placeholder="Competition name" value={name} onChange={(event) => setName(event.target.value)} />
          <Button
            disabled={!name.trim() || create.isPending}
            onClick={() => {
              create.mutate({ name: name.trim(), competition_type: "custom", participation_mode: "individual" });
              setName("");
            }}
          >
            Create competition
          </Button>
        </div>
      </GlassPanel>

      <GlassPanel padded={false} className="mb-4">
        {competitions.isLoading ? (
          <p className="p-5 text-sm text-[var(--foreground-muted)]">Loading competitions…</p>
        ) : competitions.isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => competitions.refetch()} />
          </div>
        ) : !competitions.data?.items.length ? (
          <div className="p-5">
            <EmptyState title="No competitions" description="Create a competition for this event." />
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Mode</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {competitions.data.items.map((competition) => (
                  <TableRow
                    key={competition.id}
                    clickable
                    className={selected?.id === competition.id ? "bg-[var(--accent-soft)]" : undefined}
                    onClick={() => setSelectedId(competition.id)}
                  >
                    <TableCell className="font-medium text-[var(--foreground)]">{competition.name}</TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">{competition.competition_type}</TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">{competition.participation_mode}</TableCell>
                    <TableCell className="capitalize text-[var(--foreground-muted)]">{competition.status.replaceAll("_", " ")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </GlassPanel>

      {selected && (
        <div className="grid gap-4 lg:grid-cols-3">
          <GlassPanel>
            <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Stages</h2>
            <div className="mb-3.5 flex gap-2">
              <Input placeholder="Stage name" value={stageName} onChange={(event) => setStageName(event.target.value)} />
              <Button
                disabled={!stageName.trim() || createStage.isPending}
                onClick={() => {
                  createStage.mutate({ name: stageName.trim(), stage_type: "group", order_index: (details.stages.data?.length ?? 0) + 1 });
                  setStageName("");
                }}
              >
                Add
              </Button>
            </div>
            {details.stages.isLoading ? (
              <p className="text-sm text-[var(--foreground-muted)]">Loading…</p>
            ) : details.stages.isError ? (
              <ErrorState onRetry={() => details.stages.refetch()} />
            ) : details.stages.data?.length ? (
              <ul className="space-y-2 text-sm">
                {details.stages.data.map((stage) => (
                  <li key={stage.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] p-2 text-[var(--foreground)]">
                    {stage.order_index}. {stage.name} <span className="text-[var(--foreground-subtle)]">({stage.stage_type})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">No stages configured.</p>
            )}
          </GlassPanel>

          <GlassPanel>
            <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Fixtures</h2>
            <div className="mb-3.5 grid gap-2">
              <Input placeholder="Stage ID" value={stageId} onChange={(event) => setStageId(event.target.value)} />
              <Input type="datetime-local" value={matchStart} onChange={(event) => setMatchStart(event.target.value)} />
              <Input type="datetime-local" value={matchEnd} onChange={(event) => setMatchEnd(event.target.value)} />
              <Button
                disabled={!stageId || !matchStart || !matchEnd || createMatch.isPending}
                onClick={() =>
                  createMatch.mutate({
                    stage_id: stageId,
                    round_number: 1,
                    match_number: (details.matches.data?.total ?? 0) + 1,
                    scheduled_start: new Date(matchStart).toISOString(),
                    scheduled_end: new Date(matchEnd).toISOString(),
                  })
                }
              >
                Schedule fixture
              </Button>
            </div>
            {details.matches.isLoading ? (
              <p className="text-sm text-[var(--foreground-muted)]">Loading…</p>
            ) : details.matches.isError ? (
              <ErrorState onRetry={() => details.matches.refetch()} />
            ) : details.matches.data?.items.length ? (
              <ul className="space-y-2 text-sm">
                {details.matches.data.items.map((match) => (
                  <li key={match.id} className="rounded-[var(--radius-sm)] border border-[var(--border)] p-2 text-[var(--foreground)]">
                    Round {match.round_number}, match {match.match_number}
                    <br />
                    <span className="text-[var(--foreground-subtle)]">
                      {match.status} | {match.score_a ?? "-"} : {match.score_b ?? "-"}
                    </span>
                    {match.status !== "completed" && (
                      <Button size="sm" className="mt-2" onClick={() => setResultMatchId(match.id)}>
                        Record result
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">No fixtures scheduled.</p>
            )}
            {resultMatchId && (
              <div className="mt-3.5 grid gap-2">
                <Input placeholder="Score A" type="number" value={scoreA} onChange={(event) => setScoreA(event.target.value)} />
                <Input placeholder="Score B" type="number" value={scoreB} onChange={(event) => setScoreB(event.target.value)} />
                <Input placeholder="Winner entry ID (optional for draw)" value={winnerId} onChange={(event) => setWinnerId(event.target.value)} />
                <Button
                  disabled={recordResult.isPending}
                  onClick={() => {
                    recordResult.mutate({
                      matchId: resultMatchId,
                      payload: {
                        score_a: Number(scoreA),
                        score_b: Number(scoreB),
                        result_status: winnerId ? "win" : "draw",
                        ...(winnerId ? { winner_entry_id: winnerId } : {}),
                      },
                    });
                    setResultMatchId("");
                  }}
                >
                  Save result
                </Button>
              </div>
            )}
          </GlassPanel>

          <GlassPanel>
            <h2 className="mb-3.5 text-sm font-semibold text-[var(--foreground)]">Standings</h2>
            {details.standings.isLoading ? (
              <p className="text-sm text-[var(--foreground-muted)]">Loading…</p>
            ) : details.standings.isError ? (
              <ErrorState onRetry={() => details.standings.refetch()} />
            ) : details.standings.data?.length ? (
              <ul className="space-y-2 text-sm">
                {details.standings.data.map((row) => (
                  <li key={row.entry_id} className="flex justify-between rounded-[var(--radius-sm)] border border-[var(--border)] p-2">
                    <span className="text-[var(--foreground)]">#{row.position} {row.entry_id.slice(0, 8)}</span>
                    <strong className="text-[var(--foreground)]">{row.points} pts</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">Standings appear after results.</p>
            )}
          </GlassPanel>
        </div>
      )}
    </div>
  );
}