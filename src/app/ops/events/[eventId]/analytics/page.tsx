"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, CircleDollarSign, Users, Ticket, MessageSquare } from "lucide-react";
import { useEventAnalytics, useEventAnalyticsComparison, useEventAnalyticsTimeSeries } from "@/hooks/useReports";
import { KPICard } from "@/components/reports/kpi-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { ErrorState, EmptyState } from "@/components/shared/states";

export default function EventAnalyticsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const filters = { start: start ? `${start}T00:00:00Z` : undefined, end: end ? `${end}T23:59:59Z` : undefined };
  const analytics = useEventAnalytics(eventId, filters);
  const series = useEventAnalyticsTimeSeries(eventId, filters);
  const comparison = useEventAnalyticsComparison(eventId, filters);
  if (analytics.isLoading || series.isLoading || comparison.isLoading) return <p className="p-6">Loading analytics...</p>;
  if (analytics.isError || series.isError || comparison.isError) return <div className="p-6"><ErrorState description="Unable to load event analytics." onRetry={() => { analytics.refetch(); series.refetch(); comparison.refetch(); }} /></div>;
  if (!analytics.data) return <div className="p-6"><EmptyState icon={BarChart3} title="No analytics available" /></div>;
  const data = analytics.data;
  const revenue = data.revenue;
  return <div className="space-y-6">
    <Link href={`/ops/events/${eventId}`} className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]"><ArrowLeft className="h-4 w-4" /> Back to event</Link>
    <header><h1 className="text-2xl font-semibold">Event analytics</h1><p className="text-sm text-[var(--foreground-muted)]">{data.event_name} · server-derived performance metrics</p></header>
    <GlassPanel><div className="flex flex-wrap items-end gap-3"><label className="text-sm">From<Input type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label><label className="text-sm">To<Input type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label></div></GlassPanel>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5"><KPICard label="Registrations" value={data.registrations.total ?? 0} icon={Users} /><KPICard label="Confirmed" value={data.registrations.confirmed ?? 0} icon={Users} tone="success" /><KPICard label="Capacity used" value={`${data.capacity.utilization_rate ?? 0}%`} icon={BarChart3} tone="info" /><KPICard label="Check-ins" value={data.attendance.check_ins ?? 0} icon={Ticket} tone="accent" /><KPICard label="Feedback" value={data.feedback.submitted ?? 0} icon={MessageSquare} /></div>
    {revenue && <div className="grid grid-cols-2 gap-4 lg:grid-cols-5"><KPICard label="Gross collected" value={`₹${Number(revenue.gross ?? 0).toLocaleString("en-IN")}`} icon={CircleDollarSign} tone="success" /><KPICard label="Net collected" value={`₹${Number(revenue.net_collected ?? 0).toLocaleString("en-IN")}`} icon={CircleDollarSign} /><KPICard label="Refunded" value={`₹${Number(revenue.refunded_amount ?? 0).toLocaleString("en-IN")}`} icon={CircleDollarSign} tone="warning" /><KPICard label="Pending amount" value={`₹${Number(revenue.pending_amount ?? 0).toLocaleString("en-IN")}`} icon={CircleDollarSign} tone="info" /><KPICard label="Reconciliation issues" value={Number(revenue.reconciliation_attention ?? 0)} icon={BarChart3} tone="warning" /></div>}
    {comparison.data && <GlassPanel><h2 className="mb-3 font-semibold">Previous-period comparison</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Object.entries(comparison.data).filter(([key]) => ["registrations", "attendance", "engagement", "revenue"].includes(key)).map(([key, value]) => <div className="rounded-lg bg-black/[0.03] p-3" key={key}><p className="text-xs capitalize text-[var(--foreground-muted)]">{key}</p><p className="text-lg font-semibold">{(value as { current: number }).current}</p><p className="text-xs text-[var(--foreground-muted)]">Previous {(value as { previous: number }).previous} · {(value as { change_pct: number | null }).change_pct == null ? "—" : `${(value as { change_pct: number }).change_pct}%`}</p></div>)}</div></GlassPanel>}
    <div className="grid gap-6 lg:grid-cols-2"><GlassPanel><h2 className="mb-3 font-semibold">Registration funnel</h2><div className="space-y-2 text-sm">{Object.entries(data.funnel).map(([key, value]) => <div className="flex justify-between border-b py-2" key={key}><span className="capitalize text-[var(--foreground-muted)]">{key.replaceAll("_", " ")}</span><strong>{value}</strong></div>)}</div></GlassPanel><GlassPanel><h2 className="mb-3 font-semibold">Engagement and attendance</h2><div className="space-y-2 text-sm">{Object.entries({ ...data.engagement, ...data.attendance, ...data.feedback }).map(([key, value]) => <div className="flex justify-between border-b py-2" key={key}><span className="capitalize text-[var(--foreground-muted)]">{key.replaceAll("_", " ")}</span><strong>{value ?? "—"}</strong></div>)}</div></GlassPanel></div>
    <GlassPanel><h2 className="mb-3 font-semibold">Daily activity</h2>{series.data && Object.entries(series.data).filter(([key]) => Array.isArray(series.data?.[key as keyof typeof series.data])).map(([key, values]) => <div className="mb-4" key={key}><p className="mb-1 text-sm font-medium capitalize">{key.replaceAll("_", " ")}</p><div className="flex flex-wrap gap-2">{(values as { date: string; count: number }[]).map((item) => <span className="rounded bg-black/[0.04] px-2 py-1 text-xs" key={`${key}-${item.date}`}>{item.date}: {item.count}</span>)}</div></div>)}</GlassPanel>
  </div>;
}
