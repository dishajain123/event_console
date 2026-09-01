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
import { Textarea } from "@/components/ui/textarea";
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
import type { ConfigurableField, EventDetailSettings } from "@/types/configEngine";

const configSchema = z.object({
  feeAmount: z.string().optional(),
  currency: z.string().min(1),
  capacity: z.string().optional(),
  approvalRequired: z.boolean(),
});
type ConfigFormValues = z.infer<typeof configSchema>;

const emptyDetails: EventDetailSettings = {
  registration_start_at: null,
  registration_end_at: null,
  event_start_at: null,
  event_end_at: null,
  venue_name: null,
  venue_address: null,
  venue_location: null,
  age_group: null,
  age_min: null,
  age_max: null,
  eligibility_notes: null,
  maximum_participants: null,
  minimum_participants: null,
  registration_fee: null,
  event_type: null,
  team_size_min: null,
  team_size_max: null,
  gender_eligibility: null,
  event_image_url: null,
  banner_url: null,
  rules_and_guidelines: null,
  terms_and_conditions: null,
  cancellation_policy: null,
  required_documents: [],
  contact_name: null,
  contact_email: null,
  contact_phone: null,
  registration_status: null,
  custom_registration_questions: [],
};

function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDateTimeLocal(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

function toMultilineText(values: string[] | null | undefined): string {
  return (values ?? []).join("\n");
}

function fromMultilineText(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

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
  const [details, setDetails] = useState<EventDetailSettings>(emptyDetails);

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
    // The query resolves asynchronously; this hydrates the editable form state from backend data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticipationTypes(configuration.participation_types ?? []);
    setRules((configuration.rules as RulesValue) ?? {});
    setDetails({
      ...emptyDetails,
      ...configuration.details,
      required_documents: configuration.details?.required_documents ?? [],
      custom_registration_questions: configuration.details?.custom_registration_questions ?? [],
    });
    if (!selectedType && configuration.participation_types?.length) {
      setSelectedType(configuration.participation_types[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration]);

  useEffect(() => {
    // The field schema is also backend-driven and needs to hydrate the local builder state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFields(fieldSchema?.fields ?? []);
  }, [fieldSchema]);

  function setDetail<K extends keyof EventDetailSettings>(key: K, value: EventDetailSettings[K]) {
    setDetails((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function onSaveConfiguration(values: ConfigFormValues) {
    try {
      await upsertConfig.mutateAsync({
        participation_types: participationTypes,
        fee_amount: values.feeAmount ? Number(values.feeAmount) : null,
        currency: values.currency,
        capacity: values.capacity ? Number(values.capacity) : null,
        approval_required: values.approvalRequired,
        details: {
          ...details,
          registration_fee: values.feeAmount ? Number(values.feeAmount) : null,
        },
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
        {/* Event details */}
        <GlassPanel className="rise-in">
          <h2 className="mb-1 text-sm font-semibold text-[var(--foreground)]">Event details</h2>
          <p className="mb-4 text-xs text-[var(--foreground-muted)]">
            These fields are stored in the backend and can be reused by the mobile app.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Registration start
                </label>
                <Input
                  type="datetime-local"
                  value={toDateTimeLocal(details.registration_start_at)}
                  onChange={(e) => setDetail("registration_start_at", fromDateTimeLocal(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Registration end
                </label>
                <Input
                  type="datetime-local"
                  value={toDateTimeLocal(details.registration_end_at)}
                  onChange={(e) => setDetail("registration_end_at", fromDateTimeLocal(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Event start
                </label>
                <Input
                  type="datetime-local"
                  value={toDateTimeLocal(details.event_start_at)}
                  onChange={(e) => setDetail("event_start_at", fromDateTimeLocal(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Event end
                </label>
                <Input
                  type="datetime-local"
                  value={toDateTimeLocal(details.event_end_at)}
                  onChange={(e) => setDetail("event_end_at", fromDateTimeLocal(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Venue / Location
                </label>
                <Input
                  placeholder="Venue or location name"
                  value={details.venue_name ?? ""}
                  onChange={(e) => setDetail("venue_name", e.target.value || null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Venue address
                </label>
                <Input
                  placeholder="Street, city, venue details"
                  value={details.venue_address ?? ""}
                  onChange={(e) => setDetail("venue_address", e.target.value || null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Venue notes
                </label>
                <Input
                  placeholder="Google Maps pin, landmark, hall number"
                  value={details.venue_location ?? ""}
                  onChange={(e) => setDetail("venue_location", e.target.value || null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Age group</label>
                <Input
                  placeholder="e.g. 16-25 years"
                  value={details.age_group ?? ""}
                  onChange={(e) => setDetail("age_group", e.target.value || null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Age min</label>
                <Input
                  type="number"
                  value={details.age_min ?? ""}
                  onChange={(e) => setDetail("age_min", e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Age max</label>
                <Input
                  type="number"
                  value={details.age_max ?? ""}
                  onChange={(e) => setDetail("age_max", e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Minimum participants
                </label>
                <Input
                  type="number"
                  value={details.minimum_participants ?? ""}
                  onChange={(e) =>
                    setDetail("minimum_participants", e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Maximum participants
                </label>
                <Input
                  type="number"
                  value={details.maximum_participants ?? ""}
                  onChange={(e) =>
                    setDetail("maximum_participants", e.target.value ? Number(e.target.value) : null)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Event type</label>
                <Select
                  value={details.event_type ?? ""}
                  onChange={(e) => setDetail("event_type", e.target.value || null)}
                >
                  <option value="">Select type</option>
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Team size min</label>
                <Input
                  type="number"
                  value={details.team_size_min ?? ""}
                  onChange={(e) => setDetail("team_size_min", e.target.value ? Number(e.target.value) : null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Team size max</label>
                <Input
                  type="number"
                  value={details.team_size_max ?? ""}
                  onChange={(e) => setDetail("team_size_max", e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Gender eligibility
                </label>
                <Input
                  placeholder="Any / Women / Men / Mixed"
                  value={details.gender_eligibility ?? ""}
                  onChange={(e) => setDetail("gender_eligibility", e.target.value || null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Event image URL
                </label>
                <Input
                  placeholder="https://..."
                  value={details.event_image_url ?? ""}
                  onChange={(e) => setDetail("event_image_url", e.target.value || null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Banner URL
                </label>
                <Input
                  placeholder="https://..."
                  value={details.banner_url ?? ""}
                  onChange={(e) => setDetail("banner_url", e.target.value || null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Registration status</label>
                <Select
                  value={details.registration_status ?? ""}
                  onChange={(e) => setDetail("registration_status", e.target.value || null)}
                >
                  <option value="">Select status</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="full">Full</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Contact name
                </label>
                <Input
                  placeholder="Contact person"
                  value={details.contact_name ?? ""}
                  onChange={(e) => setDetail("contact_name", e.target.value || null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Contact phone
                </label>
                <Input
                  placeholder="+91..."
                  value={details.contact_phone ?? ""}
                  onChange={(e) => setDetail("contact_phone", e.target.value || null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Contact email
                </label>
                <Input
                  type="email"
                  placeholder="contact@example.com"
                  value={details.contact_email ?? ""}
                  onChange={(e) => setDetail("contact_email", e.target.value || null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Eligibility notes
                </label>
                <Input
                  placeholder="Short note shown to participants"
                  value={details.eligibility_notes ?? ""}
                  onChange={(e) => setDetail("eligibility_notes", e.target.value || null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Required documents
                </label>
                <Textarea
                  rows={4}
                  placeholder="One document per line"
                  value={toMultilineText(details.required_documents)}
                  onChange={(e) => setDetail("required_documents", fromMultilineText(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Custom registration questions
                </label>
                <Textarea
                  rows={4}
                  placeholder="One question per line"
                  value={toMultilineText(details.custom_registration_questions)}
                  onChange={(e) =>
                    setDetail("custom_registration_questions", fromMultilineText(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Rules / guidelines
                </label>
                <Textarea
                  rows={4}
                  placeholder="Event-specific rules and guidelines"
                  value={details.rules_and_guidelines ?? ""}
                  onChange={(e) => setDetail("rules_and_guidelines", e.target.value || null)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Terms and conditions
                </label>
                <Textarea
                  rows={4}
                  placeholder="Registration and event terms"
                  value={details.terms_and_conditions ?? ""}
                  onChange={(e) => setDetail("terms_and_conditions", e.target.value || null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Cancellation policy
                </label>
                <Textarea
                  rows={4}
                  placeholder="How cancellations work"
                  value={details.cancellation_policy ?? ""}
                  onChange={(e) => setDetail("cancellation_policy", e.target.value || null)}
                />
              </div>
            </div>
          </div>
        </GlassPanel>

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
