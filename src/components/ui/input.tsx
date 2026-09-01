import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "glass-input h-11 w-full px-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)]",
        error && "border-[var(--danger)] focus-within:ring-red-200",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
