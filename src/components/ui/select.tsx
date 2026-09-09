import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Public API unchanged. This is a native <select>, so its options
 * popup is rendered by the browser's own top layer — it was never the
 * source of the "dropdown covers its own label" class of bug. That
 * fix lives in the new Popover/DropdownMenu primitives (see
 * ui/popover.tsx), which any future custom dropdown should build on
 * instead of a bespoke absolutely-positioned div.
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "glass-input h-9 w-full appearance-none px-3 pr-9 text-sm text-[var(--foreground)] outline-none",
          error && "border-[var(--danger)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--foreground-subtle)]" />
    </div>
  ),
);
Select.displayName = "Select";