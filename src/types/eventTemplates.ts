export interface EventTemplate {
  id: string;
  owner_user_id: string;
  organization_id: string | null;
  source_event_id: string | null;
  name: string;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventTemplatePage {
  items: EventTemplate[];
  total: number;
  page: number;
  page_size: number;
}

export interface EventTemplateDateInput {
  name: string;
  start_date: string;
  end_date: string;
}
