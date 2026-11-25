// The ledger's arithmetic — pure, so it can be checked without a browser.
// Calendar days in the asker's own timezone, a merge that never loses a Mark
// to a second tab, and a scorecard that counts only windows that have closed.

import type { OracleId } from "./oracle";

export interface Mark {
  id: string;
  oracle: OracleId;
  question: string;
  text: string;
  createdAt: number;
  dueAt: number;
  status: "pending" | "true" | "miss";
  updatedAt?: number; // last status change — the newest one wins a merge
}

export const DAY = 86400000;

/** Local midnight of the day holding t. */
export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** N calendar days on, same wall-clock time — DST cannot shift it an hour. */
export function dueAtFrom(created: number, days: number): number {
  const d = new Date(created);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

/** Whole calendar days from today to the day the Mark comes due. */
export function daysUntil(dueAt: number, now: number): number {
  return Math.round((startOfDay(dueAt) - startOfDay(now)) / DAY);
}

/** "Thu, Oct 22" — the day itself, so the countdown can be checked against a calendar. */
export function dueDateLabel(dueAt: number, now: number): string {
  const d = new Date(dueAt);
  if (daysUntil(dueAt, now) === 0) return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

const STATUSES = new Set(["pending", "true", "miss"]);

/** Parse a stored ledger. null when absent or unreadable — never a silent []. */
export function readMarks(raw: string | null): Mark[] | null {
  if (!raw) return null;
  try {
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return null;
    return v.filter(
      (m): m is Mark =>
        !!m && typeof m === "object" &&
        typeof m.id === "string" && typeof m.text === "string" &&
        typeof m.createdAt === "number" && typeof m.dueAt === "number" &&
        STATUSES.has(m.status),
    ).map((m) => ({ ...m, question: typeof m.question === "string" ? m.question : "" }));
  } catch {
    return null;
  }
}

const touched = (m: Mark) => m.updatedAt ?? m.createdAt;

/** Union by id; the newer status wins, ties go to `a`. Stable order: newest first. */
export function mergeMarks(a: Mark[], b: Mark[]): Mark[] {
  const by = new Map<string, Mark>();
  for (const m of [...a, ...b]) {
    const have = by.get(m.id);
    if (!have || touched(m) > touched(have)) by.set(m.id, m);
  }
  return [...by.values()].sort((x, y) => y.createdAt - x.createdAt || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
}

/**
 * The honest scorecard. A Mark only counts once its window has closed —
 * early hits wait for their date like misses must. Closed windows nobody has
 * answered are "unreckoned", shown apart, never quietly dropped.
 */
export function scorecard(marks: Mark[], now: number) {
  const fulfilled = marks.filter((m) => m.status === "true").length;
  const matured = marks.filter((m) => m.dueAt <= now);
  const hits = matured.filter((m) => m.status === "true").length;
  const reckoned = matured.filter((m) => m.status !== "pending").length;
  const unreckoned = matured.length - reckoned;
  const rate = reckoned ? Math.round((hits / reckoned) * 100) : null;
  return { watched: marks.length, fulfilled, reckoned, unreckoned, rate };
}
