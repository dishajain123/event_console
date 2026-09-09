"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * A new, additive primitive — the anchored floating panel every future
 * custom dropdown/menu/date-picker in the console should be built on,
 * instead of a bespoke `absolute` div. It exists specifically to
 * satisfy the "dropdown must never cover its own trigger/label"
 * requirement, by construction rather than by convention:
 *
 * - Renders into a `document.body` portal, so it is never clipped by
 *   an ancestor's `overflow: hidden` (a filter bar, a sticky table
 *   header, a scroll container) and never loses a z-index fight with
 *   page content.
 * - Measures the trigger's real position via `getBoundingClientRect`
 *   and places the panel *below* it by default; if there isn't enough
 *   viewport room below, it flips to open *above* instead — so the
 *   panel can never render on top of the field/label that opened it.
 * - Clamps horizontally so it never overflows the right edge of the
 *   viewport.
 * - Recalculates on scroll/resize while open, and closes on outside
 *   click or Escape.
 *
 * Usage: wrap a trigger element with `renderTrigger`, and put the
 * floating content in `children`. Nothing about this component
 * depends on what's inside — a menu, a checklist, a date range picker
 * can all use it the same way.
 */
export function Popover({
  renderTrigger,
  children,
  align = "start",
  className,
  panelClassName,
  open: controlledOpen,
  onOpenChange,
}: {
  renderTrigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
  panelClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; placement: "top" | "bottom" } | null>(null);

  const recalculate = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger) return;
    const triggerRect = trigger.getBoundingClientRect();
    const panelHeight = panel?.offsetHeight ?? 240;
    const panelWidth = panel?.offsetWidth ?? triggerRect.width;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const placement: "top" | "bottom" = spaceBelow < panelHeight + 12 && triggerRect.top > panelHeight + 12 ? "top" : "bottom";
    const top = placement === "bottom" ? triggerRect.bottom + 6 : triggerRect.top - panelHeight - 6;
    let left = align === "end" ? triggerRect.right - panelWidth : triggerRect.left;
    left = Math.min(Math.max(left, 8), viewportWidth - panelWidth - 8);
    setPosition({ top: Math.max(top, 8), left, placement });
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    recalculate();
  }, [open, recalculate]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function handleReposition() {
      recalculate();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, recalculate, setOpen]);

  return (
    <div className={cn("relative inline-block", className)} ref={triggerRef}>
      {renderTrigger({ open, toggle: () => setOpen(!open) })}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            style={position ? { position: "fixed", top: position.top, left: position.left } : { position: "fixed", top: -9999, left: -9999 }}
            className={cn(
              "fade-in z-50 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[0_8px_24px_rgba(20,22,31,0.14)]",
              panelClassName,
            )}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
}