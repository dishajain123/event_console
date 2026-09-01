"use client";

import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useLogout } from "@/hooks/useAuth";

export default function NoAccessPage() {
  const logout = useLogout();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <GlassPanel strong className="fade-in max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--warning-soft)]">
          <ShieldOff className="h-7 w-7 text-[var(--warning)]" />
        </div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">No Console access on this account</h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          This mobile number is verified, but it doesn&apos;t hold a Console role. Field roles (Event
          Coordinator, Volunteer Head, Volunteer) work entirely from the mobile app. If this seems wrong,
          ask an Operations Admin to check your account.
        </p>
        <Button variant="outline" className="mt-6" onClick={logout}>
          Sign out
        </Button>
      </GlassPanel>
    </main>
  );
}
