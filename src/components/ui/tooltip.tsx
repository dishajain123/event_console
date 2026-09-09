"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * A new, additive component — a real tooltip for icon-only controls
 * (table row actions, the collapsed sidebar's nav items, header
 * icon buttons), replacing the browser's native `title` attribute
 * (slow to appear, unstyled, inconsistent across browsers) wherever a
 * page adopts it. Portaled and viewport-clamped for the same reason
 * as [Popover] — so it can never be clipped by a scroll container or
 * lost behind a sticky header.
 */
export function Tooltip({
  label,
  children,
  side = "top",
}: {
  label: string;
  children: ReactNode;
  side?: "top" | "right" | "bottom";
}) {
  const [visible, setVisible] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    if (side === "right") {
      setPosition({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    } else if (side === "bottom") {
      setPosition({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
    } else {
      setPosition({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    }
  }, [visible, side]);

  return (
    <span
      ref={anchorRef}
      className="inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible &&
        position &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              transform:
                side === "right"
                  ? "translateY(-50%)"
                  : side === "bottom"
                    ? "translateX(-50%)"
                    : "translate(-50%, -100%)",
            }}
            className={cn(
              "fade-in pointer-events-none z-50 whitespace-nowrap rounded-[var(--radius-sm)] bg-[var(--dark-surface)] px-2 py-1 text-xs font-medium text-[var(--dark-foreground)] shadow-lg",
            )}
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}