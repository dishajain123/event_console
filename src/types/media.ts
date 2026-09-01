/** Mirrors app/modules/media/schemas.py + models.py MediaType. */

export type MediaType = "image" | "video";

export interface HighlightOut {
  id: string;
  event_id: string;
  media_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MediaOut {
  id: string;
  event_id: string;
  uploaded_by: string;
  title: string;
  caption: string | null;
  category: string | null;
  media_type: MediaType;
  storage_key: string;
  public_url: string;
  is_published: boolean;
  sort_order: number;
  published_at: string | null;
  published_by: string | null;
  highlight: HighlightOut | null;
  created_at: string;
  updated_at: string;
}

export interface MediaUploadIn {
  title: string;
  caption?: string | null;
  category?: string | null;
  media_type: MediaType;
  source_url?: string | null;
  sort_order?: number;
  is_highlight?: boolean;
  highlight_title?: string | null;
  highlight_description?: string | null;
  highlight_order?: number;
}
