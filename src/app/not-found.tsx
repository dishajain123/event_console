import Link from "next/link";
import { Compass } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <GlassPanel strong className="fade-in max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
          <Compass className="h-7 w-7 text-[var(--accent-strong)]" />
        </div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">Page not found</h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          This screen doesn&apos;t exist, or hasn&apos;t shipped yet in the current build phase.
        </p>
        <Link href="/">
          <Button variant="outline" className="mt-6">
            Back to your workspace
          </Button>
        </Link>
      </GlassPanel>
    </main>
  );
}
