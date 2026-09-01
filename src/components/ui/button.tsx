import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-white shadow-md shadow-indigo-500/25 hover:bg-[var(--accent-strong)] hover:shadow-lg hover:shadow-indigo-500/30 focus-visible:ring-[var(--accent-ring)]",
        glass:
          "glass-input text-[var(--foreground)] hover:bg-white/75 focus-visible:ring-[var(--accent-ring)]",
        ghost:
          "text-[var(--foreground-muted)] hover:bg-black/[0.04] hover:text-[var(--foreground)] focus-visible:ring-[var(--accent-ring)]",
        danger:
          "bg-[var(--danger)] text-white shadow-md shadow-red-500/20 hover:bg-red-600 focus-visible:ring-red-300",
        outline:
          "border border-[rgba(148,152,184,0.35)] bg-white/40 text-[var(--foreground)] hover:bg-white/70 focus-visible:ring-[var(--accent-ring)]",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
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
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
