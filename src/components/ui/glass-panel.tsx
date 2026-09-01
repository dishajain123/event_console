import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
  dark?: boolean;
  padded?: boolean;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, strong, dark, padded = true, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        dark ? "glass-panel-dark" : strong ? "glass-panel-strong" : "glass-panel",
        padded && "p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
GlassPanel.displayName = "GlassPanel";
