"use client";

import { useRef, useState } from "react";
import { ImageUp, Trash2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventImagePlaceholder } from "@/components/events/event-image-placeholder";
import { useRemoveEventImage, useSetEventImage } from "@/hooks/useEvents";
import type { ApiError } from "@/api/client";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function EventImageField({
  eventId,
  imageUrl,
}: {
  eventId: string;
  imageUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const setImage = useSetEventImage(eventId);
  const removeImage = useRemoveEventImage(eventId);
  const [error, setError] = useState<string | null>(null);
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);

  const busy = setImage.isPending || removeImage.isPending;
  const showImage = imageUrl && imageUrl !== brokenUrl;

  async function onPick(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    try {
      await setImage.mutateAsync(file);
      setBrokenUrl(null);
    } catch (err) {
      setError((err as ApiError)?.message ?? "Couldn't upload this image. Please try again.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Event cover"
            className="h-full w-full object-cover"
            onError={() => setBrokenUrl(imageUrl)}
          />
        ) : (
          <EventImagePlaceholder seed={eventId} className="h-full w-full" iconClassName="h-10 w-10" />
        )}
      </div>

      <p className="mt-2 text-xs text-[var(--foreground-subtle)]">
        JPEG, PNG, or WebP up to 5 MB. Images are cropped to a 16:9 cover.
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex-1"
          loading={setImage.isPending}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <ImageUp className="h-4 w-4" />
          {imageUrl ? "Replace" : "Upload image"}
        </Button>
        {imageUrl && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="flex-1"
            loading={removeImage.isPending}
            disabled={busy}
            onClick={async () => {
              setError(null);
              try {
                await removeImage.mutateAsync();
                setBrokenUrl(null);
              } catch (err) {
                setError((err as ApiError)?.message ?? "Couldn't remove this image.");
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-[var(--radius-sm)] bg-[var(--danger-soft)] p-3 text-sm text-[var(--danger)]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
