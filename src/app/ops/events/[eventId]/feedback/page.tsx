"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FeedbackWorkspace } from "@/components/feedback/feedback-workspace";

export default function EventFeedbackPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  return (
    <div>
      <Link href={`/ops/events/${eventId}`} className="mb-4 flex items-center gap-1.5 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
        <ArrowLeft className="h-4 w-4" /> Back to event
      </Link>
      <FeedbackWorkspace eventId={eventId} />
    </div>
  );
}
