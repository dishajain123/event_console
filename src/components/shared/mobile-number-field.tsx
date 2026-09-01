"use client";

import { Input } from "@/components/ui/input";
import { INDIA_DIAL_CODE, sanitizeIndianMobileInput } from "@/lib/phone";
import { cn } from "@/lib/utils";

interface MobileNumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string | null;
  helperText?: string;
  autoFocus?: boolean;
}

export function MobileNumberField({
  id,
  label,
  value,
  onChange,
  placeholder = "98765 43210",
  error = false,
  errorMessage,
  helperText,
  autoFocus,
}: MobileNumberFieldProps) {
  const describedBy = [errorMessage ? `${id}-error` : null, helperText ? `${id}-help` : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-0 top-1/2 flex h-11 -translate-y-1/2 items-center rounded-l-[var(--radius-sm)] border-r border-black/[0.06] bg-black/[0.02] px-3.5 text-sm font-medium text-[var(--foreground-muted)]">
          {INDIA_DIAL_CODE}
        </span>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(sanitizeIndianMobileInput(e.target.value))}
          error={error}
          aria-describedby={describedBy}
          className={cn("pl-16")}
          autoFocus={autoFocus}
        />
      </div>
      {errorMessage ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-[var(--danger)]">
          {errorMessage}
        </p>
      ) : null}
      {helperText ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-[var(--foreground-subtle)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
