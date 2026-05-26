import { format, isSameDay, startOfDay } from 'date-fns';

/** Parse due_date without UTC day-shift (YYYY-MM-DD → local calendar day). */
export function parseDueDate(value?: string | null): Date | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();

  const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const y = Number(dateOnly[1]);
    const m = Number(dateOnly[2]);
    const d = Number(dateOnly[3]);
    const local = new Date(y, m - 1, d);
    return Number.isNaN(local.getTime()) ? null : local;
  }

  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isSameCalendarDay(value: string | undefined | null, day: Date): boolean {
  const parsed = parseDueDate(value);
  if (!parsed) return false;
  return isSameDay(parsed, day);
}

export function formatDueDate(value?: string | null, pattern = 'MMM d, yyyy'): string | null {
  const d = parseDueDate(value);
  if (!d) return null;
  return format(d, pattern);
}

export function formatDueTime(value?: string | null): string | null {
  const d = parseDueDate(value);
  if (!d) return null;
  if (d.getHours() === 0 && d.getMinutes() === 0) return null;
  return format(d, 'h:mm a');
}

export function isOverdueDueDate(value?: string | null, done = false): boolean {
  if (!value || done) return false;
  const d = parseDueDate(value);
  if (!d) return false;
  return startOfDay(d) < startOfDay(new Date());
}

export function toDateOnlyString(day: Date): string {
  return format(day, 'yyyy-MM-dd');
}
