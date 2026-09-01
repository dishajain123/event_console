"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Image as ImageIcon, Plus, Eye, EyeOff, Star } from "lucide-react";
import { Header } from "@/components/layout/header";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { TableSkeleton } from "@/components/shared/skeleton";
import { ConfirmActionDialog } from "@/components/shared/confirm-action-dialog";
import { useEvents } from "@/hooks/useEvents";
import { useEventMedia, usePublishMedia, useUploadMedia } from "@/hooks/useMedia";
import type { MediaOut, MediaType } from "@/types/media";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  caption: z.string().optional(),
  category: z.string().optional(),
  media_type: z.enum(["image", "video"]),
  source_url: z.string().url("Enter a valid URL"),
  is_highlight: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export default function MediaPage() {
  const { data: events } = useEvents();
  const [eventId, setEventId] = useState("");
  const { data: media, isLoading, isError, refetch } = useEventMedia(eventId);
  const uploadMedia = useUploadMedia(eventId);
  const publishMedia = usePublishMedia(eventId);
  const [publishTarget, setPublishTarget] = useState<MediaOut | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { media_type: "image", is_highlight: false },
  });

  async function onSubmit(values: FormValues) {
    try {
      await uploadMedia.mutateAsync({
        title: values.title,
        caption: values.caption || null,
        category: values.category || null,
        media_type: values.media_type as MediaType,
        source_url: values.source_url,
        is_highlight: values.is_highlight,
      });
      toast.success("Media added");
      reset({ media_type: values.media_type, is_highlight: false, title: "", caption: "", category: "", source_url: "" });
    } catch (err) {
      toast.error("Couldn't add media", { description: (err as { message?: string })?.message });
    }
  }

  async function handleTogglePublish() {
    if (!publishTarget) return;
    const nowPublishing = !publishTarget.is_published;
    await publishMedia.mutateAsync({ mediaId: publishTarget.id, isPublished: nowPublishing });
    toast.success(nowPublishing ? "Published" : "Unpublished", {
      description: nowPublishing
        ? "Now visible on the public event gallery."
        : "Removed from the public event gallery.",
    });
  }

  return (
    <div>
      <Header title="Media" />

      <div className="mb-4">
        <Select className="w-64" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">Select an event…</option>
          {(events ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </Select>
      </div>

      {!eventId ? (
        <GlassPanel>
          <EmptyState
            icon={ImageIcon}
            title="Pick an event to manage its media"
            description="Add photos and videos, then publish the ones ready for the public event gallery."
          />
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.6fr]">
          <GlassPanel className="rise-in h-fit">
            <h2 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Add media</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Title</label>
                <Input placeholder="Opening ceremony" {...register("title")} />
                {errors.title && <p className="mt-1 text-xs text-[var(--danger)]">{errors.title.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Source URL</label>
                <Input placeholder="https://…" {...register("source_url")} />
                {errors.source_url && (
                  <p className="mt-1 text-xs text-[var(--danger)]">{errors.source_url.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">Type</label>
                  <Select {...register("media_type")}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                    Category <span className="text-[var(--foreground-subtle)]">(optional)</span>
                  </label>
                  <Input placeholder="e.g. highlights" {...register("category")} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Caption <span className="text-[var(--foreground-subtle)]">(optional)</span>
                </label>
                <Input placeholder="Short caption" {...register("caption")} />
              </div>
              <Controller
                control={control}
                name="is_highlight"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    label="Feature as highlight"
                    description="Highlighted media appears prominently on the public event page."
                  />
                )}
              />
              <Button type="submit" className="w-full" loading={uploadMedia.isPending}>
                <Plus className="h-4 w-4" />
                Add media
              </Button>
            </form>
          </GlassPanel>

          <GlassPanel padded={false}>
            <div className="border-b border-black/[0.06] px-6 py-4">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Gallery</h2>
            </div>
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton rows={4} cols={3} />
              </div>
            ) : isError ? (
              <div className="p-6">
                <ErrorState onRetry={() => refetch()} description="Check the backend connection and try again." />
              </div>
            ) : !media || media.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={ImageIcon} title="No media added yet" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                {media.map((item) => (
                  <div key={item.id} className="glass-panel overflow-hidden rounded-[var(--radius-md)] p-0">
                    <div className="flex aspect-video items-center justify-center bg-black/[0.04]">
                      {item.media_type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.public_url} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-[var(--foreground-subtle)]" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                        {item.highlight && (
                          <Star className="h-3.5 w-3.5 shrink-0 fill-[var(--warning)] text-[var(--warning)]" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge tone={item.is_published ? "success" : "neutral"}>
                          {item.is_published ? "Published" : "Draft"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPublishTarget(item)}
                        >
                          {item.is_published ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      )}

      <ConfirmActionDialog
        open={!!publishTarget}
        onOpenChange={(open) => !open && setPublishTarget(null)}
        title={publishTarget?.is_published ? `Unpublish "${publishTarget.title}"?` : `Publish "${publishTarget?.title}"?`}
        description={
          publishTarget?.is_published
            ? "This immediately removes it from the public event gallery."
            : "This immediately makes it visible on the public event gallery."
        }
        confirmLabel={publishTarget?.is_published ? "Unpublish" : "Publish"}
        onConfirm={handleTogglePublish}
      />
    </div>
  );
}
