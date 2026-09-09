import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Public API unchanged (strong/dark/padded + all div props) — every
 * existing `<GlassPanel>` usage across the console renders identically
 * from a props standpoint. What "glass-panel" visually means changed
 * in globals.css (flat solid surface, not frosted glass) — see the
 * comment there. `Surface` is an additive alias with the same
 * implementation, for new Phase 2+ code to reach for under a name
 * that matches what it now actually renders; nothing existing needs
 * to migrate.
 */
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
        padded && "p-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
GlassPanel.displayName = "GlassPanel";

export const Surface = GlassPanel;