"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/shared/skeleton";
import { ErrorState } from "@/components/shared/states";
import { ParticipationTypeToggle } from "@/components/configuration/participation-type-toggle";
import { RulesEditor, type RulesValue } from "@/components/configuration/rules-editor";
import { DynamicFieldBuilder } from "@/components/configuration/dynamic-field-builder";
import { ValidationPreviewPanel } from "@/components/configuration/validation-preview-panel";
import { useEvent } from "@/hooks/useEvents";
import {
  useEventConfiguration,
  useFieldSchema,
  useUpsertConfiguration,
  useUpsertFieldSchema,
} from "@/hooks/useConfiguration";
import type { ConfigurableField } from "@/types/configEngine";

const configSchema = z.object({
  feeAmount: z.string().optional(),
  currency: z.string().min(1),
  capacity: z.string().optional(),
  approvalRequired: z.boolean(),
});
type ConfigFormValues = z.infer<typeof configSchema>;

export default function ConfigurationBuilderPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const { data: event } = useEvent(eventId);
  const { data: configuration, isLoading: configLoading, isError, refetch } = useEventConfiguration(eventId);
  const upsertConfig = useUpsertConfiguration(eventId);
  const upsertFieldSchema = useUpsertFieldSchema(eventId);

  const [participationTypes, setParticipationTypes] = useState<string[]>([]);
  const [rules, setRules] = useState<RulesValue>({});
  const [selectedType, setSelectedType] = useState<string>("");
  const [fields, setFields] = useState<ConfigurableField[]>([]);

  const { data: fieldSchema, isLoading: fieldSchemaLoading } = useFieldSchema(eventId, selectedType);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: { feeAmount: "", currency: "INR", capacity: "", approvalRequired: false },
  });

  // Hydrate local state once the configuration loads.
  useEffect(() => {
    if (!configuration) return;
    reset({
      feeAmount: configuration.fee_amount != null ? String(configuration.fee_amount) : "",
      currency: configuration.currency || "INR",
      capacity: configuration.capacity != null ? String(configuration.capacity) : "",
      approvalRequired: configuration.approval_required,
    });
    setParticipationTypes(configuration.participation_types ?? []);
    setRules((configuration.rules as RulesValue) ?? {});
    if (!selectedType && configuration.participation_types?.length) {
      setSelectedType(configuration.participation_types[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration]);

  useEffect(() => {
    setFields(fieldSchema?.fields ?? []);
  }, [fieldSchema]);

  async function onSaveConfiguration(values: ConfigFormValues) {
    try {
      await upsertConfig.mutateAsync({
        participation_types: participationTypes,
        fee_amount: values.feeAmount ? Number(values.feeAmount) : null,
        currency: values.currency,
        capacity: values.capacity ? Number(values.capacity) : null,
        approval_required: values.approvalRequired,
        rules,
        discount_rules: configuration?.discount_rules ?? null,
      });
      toast.success("Configuration saved", {
        description: "Registrations for this event now use these settings.",
      });
    } catch (err) {
      toast.error("Couldn't save configuration", {
        description: (err as { message?: string })?.message ?? "Please try again.",
      });
    }
  }

  async function onSaveFieldSchema() {
    if (!selectedType) return;
    try {
      await upsertFieldSchema.mutateAsync({ participation_type: selectedType, fields });
      toast.success(`Form fields saved for "${selectedType}"`);
    } catch (err) {
      toast.error("Couldn't save form fields", {
        description: (err as { message?: string })?.message ?? "Please try again.",
      });
    }
  }

  if (configLoading) {
    return (
      <div>
        <Header title="Configuration Builder" />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <Header title="Configuration Builder" />
        <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/ops/events/${eventId}`}
        className="fade-in mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {event?.name ?? "Back to event"}
      </Link>

      <Header title="Configuration Builder" />

      <form onSubmit={handleSubmit(onSaveConfiguration)} className="space-y-6">
        {/* Participation types */}
        <GlassPanel className="rise-in">
          <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Participation types</h2>
          <p className="mb-4 text-xs text-[var(--foreground-muted)]">
            Only enabled types appear as registration options in the mobile app.
          </p>
          <ParticipationTypeToggle value={participationTypes} onChange={setParticipationTypes} />
        </GlassPanel>

        {/* Fee, capacity, approval */}
        <GlassPanel className="rise-in">
          <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Fee &amp; capacity</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Fee amount
              </label>
              <Input type="number" placeholder="Free" {...register("feeAmount")} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Currency
              </label>
              <Select {...register("currency")}>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Capacity
              </label>
              <Input type="number" placeholder="Unlimited" {...register("capacity")} />
            </div>
          </div>
          <div className="mt-4 border-t border-black/[0.05] pt-4">
            <Controller
              control={control}
              name="approvalRequired"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  label="Require manual approval"
                  description="Registrations wait for a decision before payment/confirmation."
                />
              )}
            />
          </div>
        </GlassPanel>

        {/* Rules */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Eligibility rules</h2>
          <RulesEditor value={rules} onChange={setRules} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={upsertConfig.isPending} disabled={!isDirty && participationTypes.length === 0}>
            <Save className="h-4 w-4" />
            Save configuration
          </Button>
        </div>
      </form>

      {/* Dynamic field schema, per participation type */}
      {participationTypes.length > 0 && (
        <div className="mt-8 border-t border-black/[0.06] pt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Registration form fields</h2>
              <p className="text-xs text-[var(--foreground-muted)]">
                What participants fill in when registering as each type.
              </p>
            </div>
            <Select
              className="w-52"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {participationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              {fieldSchemaLoading ? (
                <CardSkeleton />
              ) : (
                <>
                  <DynamicFieldBuilder fields={fields} onChange={setFields} />
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={onSaveFieldSchema} loading={upsertFieldSchema.isPending}>
                      <ShieldCheck className="h-4 w-4" />
                      Save fields for &quot;{selectedType}&quot;
                    </Button>
                  </div>
                </>
              )}
            </div>

            <ValidationPreviewPanel eventId={eventId} participationType={selectedType} fields={fields} />
          </div>
        </div>
      )}
    </div>
  );
}
