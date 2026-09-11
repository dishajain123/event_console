"use client";

import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Loader2, Smartphone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassPanel } from "@/components/ui/glass-panel";
import { MobileNumberField } from "@/components/shared/mobile-number-field";
import { useLogin } from "@/hooks/useAuth";
import { getPostLoginRedirect } from "@/lib/rbac";
import { requestPasswordReset, resetPassword } from "@/api/identity";
import type { ApiError } from "@/api/client";
import { formatIndianMobileDisplay, normalizeIndianMobileNumber } from "@/lib/phone";
import { cn } from "@/lib/utils";

type Step = "mobile" | "otp";
type Method = "mobile" | "email";

/**
 * The Mobile/Email switch — a sliding capsule indicator rather than a
 * per-button background swap, so choosing a method reads as one motion.
 * Same visual language (icon + label, sliding white capsule on a muted
 * track) as the mobile app's redesigned auth screen, expressed through
 * this app's own design tokens.
 */
function MethodSwitch({ method, onChange }: { method: Method; onChange: (method: Method) => void }) {
  return (
    <div className="relative grid grid-cols-2 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-1">
      <div
        aria-hidden
        className="absolute top-1 bottom-1 rounded-[var(--radius-sm)] bg-[var(--surface)] shadow-sm shadow-black/5 transition-transform duration-200 ease-out"
        style={{
          left: 4,
          width: "calc(50% - 4px)",
          transform: method === "email" ? "translateX(calc(100% + 4px))" : "translateX(0)",
        }}
      />
      {(
        [
          { key: "mobile" as const, label: "Mobile", icon: Smartphone },
          { key: "email" as const, label: "Email", icon: Mail },
        ]
      ).map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "relative z-10 flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] py-2 text-sm font-semibold transition-colors",
            method === key ? "text-[var(--accent-strong)]" : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { requestOtp, verifyOtp, loginEmail } = useLogin();

  const [step, setStep] = useState<Step>("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [method, setMethod] = useState<Method>("mobile");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);

  async function handleRequestOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (method === "email") {
        if (recovery) {
          if (!recoverySent) {
            await requestPasswordReset(email.trim().toLowerCase());
            setRecoverySent(true);
          } else {
            await resetPassword(email.trim().toLowerCase(), recoveryCode, password);
            setRecovery(false);
            setRecoverySent(false);
            setError(null);
          }
          return;
        }
        await loginEmail(email.trim().toLowerCase(), password);
        router.replace("/");
        return;
      }
      const res = await requestOtp(normalizeIndianMobileNumber(mobileNumber));
      setStep("otp");
      setResendIn(res.resend_available_in_seconds);
      setTimeout(() => otpInputRef.current?.focus(), 50);
      tickResendTimer(res.resend_available_in_seconds);
    } catch (err) {
      setError((err as ApiError)?.message ?? "Couldn't send a code. Check the number and try again.");
    } finally {
      setLoading(false);
    }
  }

  function tickResendTimer(seconds: number) {
    let remaining = seconds;
    const interval = setInterval(() => {
      remaining -= 1;
      setResendIn(Math.max(remaining, 0));
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const normalizedMobileNumber = normalizeIndianMobileNumber(mobileNumber);
      const { roleAssignments } = await verifyOtp(normalizedMobileNumber, otp);
      const roles = {
        global: roleAssignments.filter((r) => r.event_id === null).map((r) => r.role_name),
        scopedEventManagerEventIds: roleAssignments
          .filter((r) => r.event_id !== null && r.role_name === "event_manager")
          .map((r) => r.event_id as string),
      };
      router.replace(getPostLoginRedirect(roles));
    } catch (err) {
      setError((err as Error)?.message ?? "That code didn't work. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && otp.length >= 4) {
      handleVerifyOtp(e as unknown as FormEvent);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Ambient glass blobs for depth — purely decorative */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-sky-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-1/3 top-1/4 h-64 w-64 rounded-full bg-violet-300/15 blur-3xl" />

      <div className="fade-in relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">Event Console</h1>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
            Sign in with a Console-provisioned account
          </p>
        </div>

        <GlassPanel strong className="rise-in p-8">
          {step === "mobile" ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <MethodSwitch method={method} onChange={(next) => { setMethod(next); setError(null); }} />
              {method === "mobile" ? <MobileNumberField
                id="mobile" label="Mobile number" value={mobileNumber} onChange={setMobileNumber}
                autoFocus error={!!error} errorMessage={error} placeholder="98765 43210"
                helperText="We'll text a one-time code to verify it's you."
              /> : <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
                    <Input
                      id="email" type="email" placeholder="you@example.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} required autoFocus className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                    {recovery ? "New password" : "Password"}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
                    <Input
                      id="password" type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters" value={password}
                      onChange={(e) => setPassword(e.target.value)} required={!recovery || recoverySent}
                      className="pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {recovery && recoverySent && <Input id="recovery-code" placeholder="Email reset code" value={recoveryCode} onChange={(e) => setRecoveryCode(e.target.value)} required />}
                {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
                <button type="button" className="text-left text-xs font-medium text-[var(--accent-strong)] hover:text-[var(--accent)]" onClick={() => { setRecovery(!recovery); setRecoverySent(false); setError(null); }}>
                  {recovery ? "Back to sign in" : "Forgot password?"}
                </button>
              </div>}
              <Button type="submit" className="w-full" loading={loading} disabled={loading || (method === "mobile" ? mobileNumber.length !== 10 : !email || (recoverySent ? !recoveryCode || password.length < 8 : recovery ? false : password.length < 8))}>
                {method === "mobile" ? "Send code" : recovery ? (recoverySent ? "Reset password" : "Send reset code") : "Sign in"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>
              <p className="text-center text-xs text-[var(--foreground-subtle)]">
                Only accounts created by an administrator can sign in here.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <p className="mb-1.5 text-sm font-medium text-[var(--foreground)]">Enter the 6-digit code</p>
                <p className="mb-3 text-xs text-[var(--foreground-muted)]">
                  Sent to <span className="font-medium text-[var(--foreground)]">{formatIndianMobileDisplay(`+91${mobileNumber}`)}</span>
                </p>
                <Input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={handleOtpKeyDown}
                  error={!!error}
                  className="text-center text-lg tracking-[0.5em]"
                  required
                />
              </div>
              {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
              <Button type="submit" className="w-full" loading={loading} disabled={otp.length < 4}>
                {loading ? "Verifying" : "Verify & sign in"}
              </Button>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                  onClick={() => {
                    setStep("mobile");
                    setOtp("");
                    setError(null);
                  }}
                >
                  Use a different number
                </button>
                <button
                  type="button"
                  disabled={resendIn > 0}
                  className="font-medium text-[var(--accent-strong)] disabled:cursor-not-allowed disabled:text-[var(--foreground-subtle)]"
                  onClick={handleRequestOtp}
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}
        </GlassPanel>
        {loading && step === "otp" && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--foreground-subtle)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Signing you in
          </div>
        )}
      </div>
    </main>
  );
}
