import { CalendarDays, Sparkles, Trophy, Mic2, Users, PartyPopper } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Deterministic gradient + icon derived from the event's id — the same
 * "no cover image" fallback strategy the Mobile App uses (see
 * `_CoverImage` / `_HeroCover` in event_app), kept visually aligned so a
 * given event reads the same way in the Console and the app. Pure CSS +
 * inline SVG icon; no static image asset.
 */
const GRADIENTS: [string, string][] = [
  ["#3b5bdb", "#5c7cfa"], // corporate / blue
  ["#0ca678", "#20c997"], // community / teal
  ["#e8590c", "#f76707"], // contribute / orange
  ["#9c36b5", "#ae3ec9"], // live / purple
];

const ICONS: LucideIcon[] = [CalendarDays, Users, Trophy, PartyPopper, Mic2, Sparkles];

function seedFor(value: string): number {
  let sum = 0;
  for (let i = 0; i < value.length; i += 1) sum += value.charCodeAt(i);
  return sum;
}

export function EventImagePlaceholder({
  seed,
  className = "",
  iconClassName = "h-5 w-5",
}: {
  seed: string;
  className?: string;
  iconClassName?: string;
}) {
  const s = seedFor(seed);
  const [from, to] = GRADIENTS[s % GRADIENTS.length];
  const Icon = ICONS[s % ICONS.length];
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden
    >
      <Icon className={`${iconClassName} text-white/90`} />
    </div>
  );
}
