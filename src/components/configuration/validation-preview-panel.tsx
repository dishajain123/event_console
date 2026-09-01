"use client";

import { useState } from "react";
import { PlayCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useValidateRegistration } from "@/hooks/useConfiguration";
import type { ConfigurableField } from "@/types/configEngine";

/**
 * Lets an Operations Admin / Event Manager sanity-check a rule or
 * field-schema change before publishing — exactly the "preview exactly
 * how this will appear" requirement from the plan — by dry-running a
 * sample payload against the real backend validation endpoint rather
 * than re-implementing the rule engine's logic in the frontend.
 */
export function ValidationPreviewPanel({
  eventId,
  participationType,
  fields,
}: {
  eventId: string;
  participationType: string;
  fields: ConfigurableField[];
}) {
  const validate = useValidateRegistration(eventId);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [teamMemberCount, setTeamMemberCount] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  async function runPreview() {
    await validate.mutateAsync({
      participation_type: participationType,
      date_of_birth: dateOfBirth || null,
      team_member_count: teamMemberCount ? Number(teamMemberCount) : null,
      documents_provided: [],
      answers,
    });
  }

  return (
    <GlassPanel className="rise-in">
      <div className="mb-4 flex items-center gap-2.5">
        <PlayCircle className="h-4 w-4 text-[var(--accent-strong)]" />
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Preview a test submission
        </p>
      </div>
      <p className="mb-4 text-xs text-[var(--foreground-muted)]">
        Runs against the real rule engine — nothing is saved or registered.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
            Sample date of birth
          </label>
          <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
            Sample team size
          </label>
          <Input
            type="number"
            placeholder="Optional"
            value={teamMemberCount}
            onChange={(e) => setTeamMemberCount(e.target.value)}
          />
        </div>
      </div>

      {fields.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {fields
            .filter((f) => f.key)
            .map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
                  {field.label || field.key}
                </label>
                <Input
                  value={answers[field.key] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.type}
                />
              </div>
            ))}
        </div>
      )}

      <Button variant="outline" size="sm" onClick={runPreview} loading={validate.isPending}>
        {!validate.isPending && <PlayCircle className="h-4 w-4" />}
        Run preview
      </Button>

      {validate.data && (
        <div className="rise-in mt-4 border-t border-black/[0.05] pt-4">
          {validate.data.is_eligible ? (
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--success)]">
              <CheckCircle2 className="h-4 w-4" />
              This submission would be accepted.
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--danger)]">
                <XCircle className="h-4 w-4" />
                This submission would be rejected:
              </div>
              <ul className="ml-6 list-disc space-y-1 text-xs text-[var(--foreground-muted)]">
                {validate.data.errors.map((err, i) => (
                  <li key={i}>
                    <span className="font-medium text-[var(--foreground)]">{err.field}:</span> {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </GlassPanel>
  );
}
