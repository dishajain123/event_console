"use client";

import { useState } from "react";
import { Plus, X, Cake, Users, FileCheck2, Gift, Braces } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";

/**
 * A structured editor over EventConfiguration.rules — a generic JSON
 * blob on the backend so a new rule type never needs a migration. This
 * component presents the rule KEYS the platform currently knows how to
 * check (min_age, max_age, team_size, required_documents, referral) as
 * proper fields, and falls back to a raw key/value editor for anything
 * else already present in the data — so a rule this UI doesn't
 * recognize yet is never silently dropped on save.
 */

const KNOWN_KEYS = ["min_age", "max_age", "team_size", "required_documents", "referral"];

export interface RulesValue {
  min_age?: number | null;
  max_age?: number | null;
  team_size?: { min?: number | null; max?: number | null };
  required_documents?: string[];
  referral?: { reward_value?: number | null; required_referrals?: number | null };
  [key: string]: unknown;
}

export function RulesEditor({
  value,
  onChange,
}: {
  value: RulesValue;
  onChange: (next: RulesValue) => void;
}) {
  const [newDoc, setNewDoc] = useState("");

  const ageEnabled = value.min_age != null || value.max_age != null;
  const teamSizeEnabled = value.team_size != null;
  const referralEnabled = value.referral != null;
  const documents = value.required_documents ?? [];

  const unknownEntries = Object.entries(value).filter(([k]) => !KNOWN_KEYS.includes(k));

  function update(patch: Partial<RulesValue>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="space-y-4">
      {/* Age rule */}
      <RuleCard
        icon={Cake}
        title="Age limit"
        description="Checked against the participant's date of birth as of the event's start date."
        enabled={ageEnabled}
        onToggle={(on) => update(on ? { min_age: null, max_age: null } : { min_age: undefined, max_age: undefined })}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
              Minimum age
            </label>
            <Input
              type="number"
              placeholder="No minimum"
              value={value.min_age ?? ""}
              onChange={(e) => update({ min_age: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
              Maximum age
            </label>
            <Input
              type="number"
              placeholder="No maximum"
              value={value.max_age ?? ""}
              onChange={(e) => update({ max_age: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
        </div>
      </RuleCard>

      {/* Team size rule */}
      <RuleCard
        icon={Users}
        title="Team size"
        description="Enforced when a team is submitted for this event."
        enabled={teamSizeEnabled}
        onToggle={(on) => update({ team_size: on ? { min: null, max: null } : undefined })}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
              Minimum members
            </label>
            <Input
              type="number"
              value={value.team_size?.min ?? ""}
              onChange={(e) =>
                update({
                  team_size: { ...value.team_size, min: e.target.value === "" ? null : Number(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
              Maximum members
            </label>
            <Input
              type="number"
              value={value.team_size?.max ?? ""}
              onChange={(e) =>
                update({
                  team_size: { ...value.team_size, max: e.target.value === "" ? null : Number(e.target.value) },
                })
              }
            />
          </div>
        </div>
      </RuleCard>

      {/* Required documents */}
      <RuleCard
        icon={FileCheck2}
        title="Required documents"
        description="A registration is blocked until each of these is provided."
        enabled={documents.length > 0}
        onToggle={(on) => update({ required_documents: on ? [] : undefined })}
      >
        <div className="mb-2 flex flex-wrap gap-2">
          {documents.map((doc) => (
            <span
              key={doc}
              className="flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent-strong)]"
            >
              {doc}
              <button
                onClick={() => update({ required_documents: documents.filter((d) => d !== doc) })}
                className="hover:text-[var(--danger)]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. aadhaar"
            value={newDoc}
            onChange={(e) => setNewDoc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newDoc.trim()) {
                e.preventDefault();
                update({ required_documents: [...documents, newDoc.trim()] });
                setNewDoc("");
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              if (newDoc.trim()) {
                update({ required_documents: [...documents, newDoc.trim()] });
                setNewDoc("");
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </RuleCard>

      {/* Referral reward */}
      <RuleCard
        icon={Gift}
        title="Referral reward"
        description="The reward value a referrer's profile is created with for this event."
        enabled={referralEnabled}
        onToggle={(on) =>
          update({ referral: on ? { reward_value: 0, required_referrals: 1 } : undefined })
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
              Reward value
            </label>
            <Input
              type="number"
              value={value.referral?.reward_value ?? ""}
              onChange={(e) =>
                update({
                  referral: { ...value.referral, reward_value: e.target.value === "" ? null : Number(e.target.value) },
                })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
              Referrals required
            </label>
            <Input
              type="number"
              value={value.referral?.required_referrals ?? ""}
              onChange={(e) =>
                update({
                  referral: {
                    ...value.referral,
                    required_referrals: e.target.value === "" ? null : Number(e.target.value),
                  },
                })
              }
            />
          </div>
        </div>
      </RuleCard>

      {/* Forward-compatible fallback for anything this editor doesn't model yet */}
      {unknownEntries.length > 0 && (
        <GlassPanel className="border border-dashed border-slate-300/70 bg-white/30">
          <div className="mb-2 flex items-center gap-2">
            <Braces className="h-4 w-4 text-[var(--foreground-subtle)]" />
            <p className="text-xs font-medium text-[var(--foreground-muted)]">
              Additional configuration (set elsewhere, preserved as-is)
            </p>
          </div>
          <pre className="overflow-x-auto rounded-[var(--radius-sm)] bg-black/[0.03] p-3 text-xs text-[var(--foreground-muted)]">
            {JSON.stringify(Object.fromEntries(unknownEntries), null, 2)}
          </pre>
        </GlassPanel>
      )}
    </div>
  );
}

function RuleCard({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  icon: typeof Cake;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (on: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <GlassPanel>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
            <Icon className="h-4 w-4 text-[var(--accent-strong)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
            <p className="text-xs text-[var(--foreground-muted)]">{description}</p>
          </div>
        </div>
        <Switch checked={enabled} onChange={onToggle} />
      </div>
      {enabled && <div className="rise-in border-t border-black/[0.05] pt-3">{children}</div>}
    </GlassPanel>
  );
}
