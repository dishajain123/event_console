import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Public API unchanged — variant/size/loading are the same props as
 * before, so every existing call site compiles and behaves the same.
 * Internals are flattened for the enterprise-console direction: no
 * colored glow shadows, tighter control heights (sm 32->28px is a bit
 * much, so heights below are h-7/h-9/h-10 rather than h-8/h-10/h-12),
 * and a quieter press state.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium transition-colors duration-120 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] focus-visible:ring-[var(--accent-ring)]",
        glass:
          "glass-input text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:ring-[var(--accent-ring)]",
        ghost:
          "text-[var(--foreground-muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)] focus-visible:ring-[var(--accent-ring)]",
        danger:
          "bg-[var(--danger)] text-white hover:bg-red-600 focus-visible:ring-red-300",
        outline:
          "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] focus-visible:ring-[var(--accent-ring)]",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-9 px-3.5",
        lg: "h-10 px-5 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";