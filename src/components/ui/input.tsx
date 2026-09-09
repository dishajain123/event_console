import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Public API unchanged. Height reduced (h-11 -> h-9) for console density. */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "glass-input h-9 w-full px-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)]",
        error && "border-[var(--danger)] focus-within:ring-red-200",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";