"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { COMMON_PARTICIPATION_TYPES } from "@/types/configEngine";
import { cn } from "@/lib/utils";

export function ParticipationTypeToggle({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [customType, setCustomType] = useState("");

  const allTypes = Array.from(new Set([...COMMON_PARTICIPATION_TYPES, ...value]));

  function toggle(type: string) {
    onChange(value.includes(type) ? value.filter((t) => t !== type) : [...value, type]);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {allTypes.map((type) => {
        const active = value.includes(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
              active
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "border-[rgba(148,152,184,0.3)] bg-white/40 text-[var(--foreground-muted)] hover:bg-white/70",
            )}
          >
            {type}
            {active && !COMMON_PARTICIPATION_TYPES.includes(type as (typeof COMMON_PARTICIPATION_TYPES)[number]) && (
              <X
                className="ml-1.5 inline h-3 w-3"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(type);
                }}
              />
            )}
          </button>
        );
      })}

      {adding ? (
        <div className="flex items-center gap-1.5">
          <Input
            autoFocus
            placeholder="custom_type"
            value={customType}
            onChange={(e) => setCustomType(e.target.value.replace(/\s+/g, "_").toLowerCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customType.trim()) {
                onChange([...value, customType.trim()]);
                setCustomType("");
                setAdding(false);
              }
              if (e.key === "Escape") setAdding(false);
            }}
            className="h-9 w-40"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-full border border-dashed border-slate-300/70 px-3 py-1.5 text-sm text-[var(--foreground-muted)] hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Custom
        </button>
      )}
    </div>
  );
}
