import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listEventMedia, publishMedia, uploadMedia } from "@/api/media";
import { useSessionStore } from "@/state/sessionStore";
import type { MediaUploadIn } from "@/types/media";

function useReady() {
  const hydrated = useSessionStore((s) => s.hydrated);
  const user = useSessionStore((s) => s.user);
  return hydrated && !!user;
}

export function useEventMedia(eventId: string) {
  const ready = useReady();
  return useQuery({
    queryKey: ["media", "event", eventId],
    queryFn: () => listEventMedia(eventId),
    enabled: ready && !!eventId,
  });
}

export function useUploadMedia(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MediaUploadIn) => uploadMedia(eventId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media", "event", eventId] }),
  });
}

export function usePublishMedia(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, isPublished }: { mediaId: string; isPublished: boolean }) =>
      publishMedia(mediaId, isPublished),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["media", "event", eventId] }),
  });
}
