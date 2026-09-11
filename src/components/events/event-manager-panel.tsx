"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useState } from "react";
import { useSessionStore } from "@/state/sessionStore";
import { useUpdateEvent } from "@/hooks/useEvents";
import { EventManagerPicker } from "./event-manager-picker";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";

export function EventManagerPanel({ eventId, currentManagerId }: { eventId: string; currentManagerId: string | null }) {
  const roles = useSessionStore(state => state.roles.global);
  if (!roles.some(role => role === "super_admin" || role === "operations_admin")) return null;
  return <ManagerForm key={currentManagerId ?? "unassigned"} eventId={eventId} currentManagerId={currentManagerId} />;
}

function ManagerForm({ eventId, currentManagerId }: { eventId: string; currentManagerId: string | null }) {
  const [selected, setSelected] = useState("");
  const update = useUpdateEvent(eventId);
  const router = useRouter();
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => apiClient.delete(`/events/${eventId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      router.replace("/ops/events");
    },
  });
  return <GlassPanel className="mb-4">
    <h2 className="mb-2 text-sm font-semibold">Change Event Manager</h2>
    <p className="mb-3 text-sm text-[var(--foreground-muted)]">The previous manager will lose access to this event. Their other event assignments will remain.</p>
    <EventManagerPicker value={selected} onChange={setSelected} />
    {update.isError && <p role="alert" className="mt-2 text-sm text-[var(--danger)]">{update.error.message}</p>}
    {update.isSuccess && <p role="status">Event Manager updated.</p>}
    <Button className="mt-3" disabled={!selected || selected === currentManagerId} loading={update.isPending}
      onClick={() => update.mutate({ organizer_user_id: selected })}>Save manager</Button>
    <Button className="ml-3" variant="ghost" loading={remove.isPending} onClick={() => {
      if (window.confirm("Delete this event? It will be hidden and its access assignments revoked. The manager account and historical records will be retained.")) remove.mutate();
    }}>Delete event</Button>
    {remove.isError && <p role="alert">{remove.error.message}</p>}
  </GlassPanel>;
}
