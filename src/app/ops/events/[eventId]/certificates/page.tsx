"use client";

import { use, useState } from "react";
import { Award } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAwardBadge,
  useBadgeAwards,
  useBadgeDefinitions,
  useCertificateTemplates,
  useEligibleParticipants,
  useEligibleBadgeParticipants,
  useEventCertificates,
  useIssueCertificate,
  useRevokeBadge,
  useRevokeCertificate,
  useUpsertBadgeDefinition,
  useUpsertCertificateTemplate,
} from "@/hooks/useCertificates";

export default function CertificatesPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const templates = useCertificateTemplates(eventId);
  const certificates = useEventCertificates(eventId);
  const saveTemplate = useUpsertCertificateTemplate(eventId);
  const saveBadge = useUpsertBadgeDefinition(eventId);
  const issue = useIssueCertificate(eventId);
  const revoke = useRevokeCertificate(eventId);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>();
  const [participantSearch, setParticipantSearch] = useState("");
  const eligible = useEligibleParticipants(eventId, selectedTemplateId, participantSearch);
  const badgeAwards = useBadgeAwards(eventId);
  const badgeDefinitions = useBadgeDefinitions(eventId);
  const awardBadge = useAwardBadge(eventId);
  const revokeBadge = useRevokeBadge(eventId);
  const [type, setType] = useState("participation");
  const [title, setTitle] = useState("Participation Certificate");
  const [issuer, setIssuer] = useState("");
  const [badgeName, setBadgeName] = useState("");
  const [selectedBadgeId, setSelectedBadgeId] = useState("");
  const [badgeSearch, setBadgeSearch] = useState("");
  const eligibleBadge = useEligibleBadgeParticipants(eventId, selectedBadgeId, badgeSearch);

  return <div className="space-y-6">
    <Header title="Certificates & Achievement Badges" />
    <p className="-mt-4 text-sm text-[var(--foreground-muted)]">Event-scoped eligibility configuration. Issuance remains server-authoritative.</p>
    {templates.isError || certificates.isError ? <ErrorState title="Unable to load certificate configuration" /> : <>
      <GlassPanel>
        <h2 className="mb-3 text-sm font-semibold">Certificate templates</h2>
        <div className="flex flex-wrap gap-2">
          <Input className="max-w-36" value={type} onChange={(e) => setType(e.target.value)} placeholder="Type" />
          <Input className="min-w-56" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
          <Input className="min-w-48" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Issuer" />
          <Button onClick={() => saveTemplate.mutate({ certificate_type: type, title, issuer_name: issuer || "Event Organizer", criteria: {} })}>Save template</Button>
        </div>
        {templates.isLoading ? <p className="mt-4">Loading...</p> : templates.data?.length ? <div className="mt-4 space-y-2">{templates.data.map((item) => <div className="rounded border p-3 text-sm" key={item.id}><span className="font-medium uppercase">{item.certificate_type}</span><span className="ml-3">{item.title}</span><Button className="ml-3" size="sm" variant="outline" onClick={() => setSelectedTemplateId(item.id)}>Review eligible</Button></div>)}</div> : <EmptyState icon={Award} title="No certificate templates" description="Configure the first eligible certificate type." />}
        {selectedTemplateId ? <div className="mt-4 rounded border p-3"><div className="mb-2 flex gap-2"><Input placeholder="Search eligible participant" value={participantSearch} onChange={(e) => setParticipantSearch(e.target.value)} /><Button size="sm" variant="outline" onClick={() => setSelectedTemplateId(undefined)}>Close</Button></div>{eligible.isLoading ? <p>Checking eligibility...</p> : eligible.data?.items.length ? <div className="space-y-2">{eligible.data.items.map((person) => <div className="flex items-center justify-between rounded border p-2 text-sm" key={`${person.registration_id}-${person.participant_id ?? "user"}`}><span>{person.full_name}<span className="ml-2 text-xs text-[var(--foreground-muted)]">{person.reason}</span></span><Button size="sm" onClick={() => issue.mutate({ templateId: selectedTemplateId, registrationId: person.registration_id, participantId: person.participant_id })}>Issue</Button></div>)}</div> : <p className="text-sm">No eligible participants found.</p>}</div> : null}
      </GlassPanel>
      <GlassPanel>
        <h2 className="mb-3 text-sm font-semibold">Issued certificates</h2>
        {certificates.isLoading ? <p>Loading...</p> : certificates.data?.items.length ? <div className="space-y-2">{certificates.data.items.map((item) => <div className="flex items-center justify-between rounded border p-3 text-sm" key={item.id}><span><span className="font-mono">{item.certificate_number}</span><span className="ml-3 capitalize">{item.status}</span></span>{item.status === "issued" ? <Button size="sm" variant="danger" onClick={() => revoke.mutate(item.id)}>Revoke</Button> : null}</div>)}</div> : <EmptyState icon={Award} title="No issued certificates" description="Eligible participants will appear here after issuance." />}
      </GlassPanel>
      <GlassPanel>
        <h2 className="mb-3 text-sm font-semibold">Achievement badge</h2>
        <div className="flex flex-wrap gap-2"><Input value={badgeName} onChange={(e) => setBadgeName(e.target.value)} placeholder="Badge name" /><Button disabled={!badgeName} onClick={() => { saveBadge.mutate({ name: badgeName, criteria: {} }); setBadgeName(""); }}>Save badge</Button></div>
        <div className="mt-3 flex flex-wrap gap-2"><select className="rounded border bg-transparent px-2 text-sm" value={selectedBadgeId} onChange={(e) => setSelectedBadgeId(e.target.value)}><option value="">Select badge</option>{badgeDefinitions.data?.map((badge) => <option key={badge.id} value={badge.id}>{badge.name}</option>)}</select><Input value={badgeSearch} onChange={(e) => setBadgeSearch(e.target.value)} placeholder="Search eligible participant" /></div>
        {selectedBadgeId ? <div className="mt-3 space-y-2">{eligibleBadge.isLoading ? <p>Checking badge eligibility...</p> : eligibleBadge.data?.items.length ? eligibleBadge.data.items.map((person) => <div className="flex items-center justify-between rounded border p-2 text-sm" key={`${person.registration_id}-${person.participant_id ?? "user"}`}><span>{person.full_name}</span><Button size="sm" onClick={() => awardBadge.mutate({ badgeId: selectedBadgeId, registrationId: person.registration_id, participantId: person.participant_id })}>Award</Button></div>) : <p className="text-sm">No eligible badge recipients found.</p>}</div> : null}
        {badgeAwards.isLoading ? <p className="mt-3">Loading awards...</p> : badgeAwards.data?.items?.length ? <div className="mt-3 space-y-2">{badgeAwards.data.items.map((award: { id: string; badge_id: string; status: string }) => <div className="flex justify-between rounded border p-2 text-sm" key={award.id}><span>Badge {award.badge_id.slice(0, 8)} · {award.status}</span>{award.status === "awarded" ? <Button size="sm" variant="danger" onClick={() => revokeBadge.mutate(award.id)}>Revoke</Button> : null}</div>)}</div> : <p className="mt-3 text-sm">No badge awards found.</p>}
      </GlassPanel>
    </>}
  </div>;
}
