/**
 * Editioning: the home page refreshes at two fixed moments per day.
 * Between refreshes, the selection and label shown to the reader must be stable.
 *
 * This module computes *which* edition is currently in effect based on the clock.
 * The actual content selection and cache invalidation live elsewhere.
 */

export type EditionSlot = "morning" | "evening";

export interface Edition {
  slot: EditionSlot;
  /** Human-readable label, e.g. "Morning Edition · Thursday, April 18". */
  label: string;
  /** The calendar date the edition belongs to. */
  date: Date;
}

const MORNING_HOUR = 7;
const EVENING_HOUR = 18;

export function getCurrentEdition(now: Date = new Date()): Edition {
  const hour = now.getHours();

  if (hour >= MORNING_HOUR && hour < EVENING_HOUR) {
    const date = startOfDay(now);
    return { slot: "morning", label: formatLabel("morning", date), date };
  }

  if (hour >= EVENING_HOUR) {
    const date = startOfDay(now);
    return { slot: "evening", label: formatLabel("evening", date), date };
  }

  // Before 7am the reader is still on yesterday's evening edition.
  const prev = new Date(now);
  prev.setDate(prev.getDate() - 1);
  const date = startOfDay(prev);
  return { slot: "evening", label: formatLabel("evening", date), date };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatLabel(slot: EditionSlot, date: Date): string {
  const name = slot === "morning" ? "Morning Edition" : "Evening Edition";
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${name} · ${weekday}, ${month} ${date.getDate()}`;
}
