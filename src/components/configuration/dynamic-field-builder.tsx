"use client";

import { GripVertical, Plus, Trash2, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { FIELD_TYPE_LABELS, type ConfigurableField, type FieldType } from "@/types/configEngine";

function newField(): ConfigurableField {
  return { key: "", label: "", type: "text", required: false, options: null };
}

export function DynamicFieldBuilder({
  fields,
  onChange,
}: {
  fields: ConfigurableField[];
  onChange: (next: ConfigurableField[]) => void;
}) {
  function updateField(index: number, patch: Partial<ConfigurableField>) {
    const next = [...fields];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-slate-300/60 py-10 text-center">
          <ListChecks className="h-7 w-7 text-[var(--foreground-subtle)]" />
          <p className="text-sm text-[var(--foreground-muted)]">
            No fields yet — this participation type&apos;s form will show nothing extra.
          </p>
        </div>
      ) : (
        fields.map((field, index) => (
          <GlassPanel key={index} padded={false} className="rise-in p-4">
            <div className="flex items-start gap-3">
              <div className="mt-2.5 flex flex-col gap-1 text-[var(--foreground-subtle)]">
                <button
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="disabled:opacity-20"
                  title="Move up"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
                    Field key
                  </label>
                  <Input
                    placeholder="tshirt_size"
                    value={field.key}
                    onChange={(e) => updateField(index, { key: e.target.value.replace(/\s+/g, "_") })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
                    Label shown to participants
                  </label>
                  <Input
                    placeholder="T-Shirt Size"
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
                    Field type
                  </label>
                  <Select
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                  >
                    {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
                {field.type === "select" && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--foreground-muted)]">
                      Options (comma separated)
                    </label>
                    <Input
                      placeholder="S, M, L, XL"
                      value={(field.options ?? []).join(", ")}
                      onChange={(e) =>
                        updateField(index, {
                          options: e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                )}
                <div className="flex items-center sm:col-span-2">
                  <Switch
                    checked={field.required}
                    onChange={(v) => updateField(index, { required: v })}
                    label="Required"
                  />
                </div>
              </div>

              <button
                onClick={() => removeField(index)}
                className="mt-1 text-[var(--foreground-subtle)] hover:text-[var(--danger)]"
                title="Remove field"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </GlassPanel>
        ))
      )}

      <Button variant="outline" size="sm" onClick={() => onChange([...fields, newField()])}>
        <Plus className="h-4 w-4" />
        Add field
      </Button>
    </div>
  );
}
