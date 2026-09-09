import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Public API unchanged. Padding tightened to match the denser Input/Select. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "glass-input min-h-[80px] w-full px-3 py-2.5 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--foreground-subtle)]",
        error && "border-[var(--danger)]",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";