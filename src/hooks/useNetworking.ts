import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { blockNetworkingParticipant, getNetworkingConfig, getNetworkingMetrics, listNetworkingConnections, listNetworkingParticipants, listNetworkingReports, updateNetworkingConfig, updateNetworkingReport } from "@/api/networking";
import type { ConnectionStatus, ReportStatus } from "@/types/networking";
import { useSessionStore } from "@/state/sessionStore";
export function useNetworking(eventId: string) {
  const ready = useSessionStore((s) => s.hydrated && !!s.user); const client = useQueryClient();
  const config = useQuery({ queryKey: ["networking", eventId, "config"], queryFn: () => getNetworkingConfig(eventId), enabled: ready && !!eventId });
  const [participantPage, setParticipantPage] = useState(1); const [participantSearch, setParticipantSearch] = useState(""); const [participantOrganization, setParticipantOrganization] = useState(""); const [participantDesignation, setParticipantDesignation] = useState("");
  const [connectionPage, setConnectionPage] = useState(1); const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | undefined>(); const [connectionSearch, setConnectionSearch] = useState("");
  const participants = useQuery({ queryKey: ["networking", eventId, "participants", participantPage, participantSearch, participantOrganization, participantDesignation], queryFn: () => listNetworkingParticipants(eventId, participantPage, participantSearch, participantOrganization, participantDesignation), enabled: ready && !!eventId });
  const connections = useQuery({ queryKey: ["networking", eventId, "connections", connectionPage, connectionStatus, connectionSearch], queryFn: () => listNetworkingConnections(eventId, connectionPage, connectionStatus, connectionSearch), enabled: ready && !!eventId });
  const reports = useQuery({ queryKey: ["networking", eventId, "reports"], queryFn: () => listNetworkingReports(eventId), enabled: ready && !!eventId });
  const metrics = useQuery({ queryKey: ["networking", eventId, "metrics"], queryFn: () => getNetworkingMetrics(eventId), enabled: ready && !!eventId });
  const saveConfig = useMutation({ mutationFn: (payload: { enabled: boolean; matchmaking_enabled: boolean; allowed_participant_types: string[] | null }) => updateNetworkingConfig(eventId, payload), onSuccess: () => client.invalidateQueries({ queryKey: ["networking", eventId] }) });
  const updateReport = useMutation({ mutationFn: ({ id, status, notes }: { id: string; status: ReportStatus; notes?: string }) => updateNetworkingReport(id, status, notes), onSuccess: () => client.invalidateQueries({ queryKey: ["networking", eventId, "reports"] }) });
  const block = useMutation({ mutationFn: (participantId: string) => blockNetworkingParticipant(eventId, participantId), onSuccess: () => client.invalidateQueries({ queryKey: ["networking", eventId] }) });
  return { config, participants, connections, reports, metrics, saveConfig, updateReport, block, participantPage, setParticipantPage, participantSearch, setParticipantSearch, participantOrganization, setParticipantOrganization, participantDesignation, setParticipantDesignation, connectionPage, setConnectionPage, connectionStatus, setConnectionStatus, connectionSearch, setConnectionSearch };
}
