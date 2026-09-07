export type CertificateTemplate = { id: string; event_id: string; certificate_type: string; title: string; description?: string | null; issuer_name: string; criteria: Record<string, unknown>; mutually_exclusive: boolean; is_active: boolean; created_at: string; updated_at: string };
export type Certificate = { id: string; event_id: string; template_id: string; registration_id: string; participant_id?: string | null; user_id: string; certificate_number: string; status: string; artifact_url?: string | null; created_at: string; updated_at: string };
export type CertificatePage = { items: Certificate[]; total: number; page: number; page_size: number };
export type EligibleParticipant = { registration_id: string; participant_id?: string | null; user_id: string; full_name: string; eligible: boolean; reason: string };
export type EligibleParticipantPage = { items: EligibleParticipant[]; total: number; page: number; page_size: number };
export type BadgeDefinition = { id: string; event_id: string; name: string; description?: string | null; icon_reference?: string | null; criteria: Record<string, unknown>; is_active: boolean; created_at: string; updated_at: string };
