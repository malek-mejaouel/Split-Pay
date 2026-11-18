/**
 * Date / time formatting helpers.
 *
 * The Figma export hardcoded labels such as "12m", "Yesterday" or
 * "Due in 4 days". In the Angular app these are derived from the API
 * timestamps, using `ClockService` as the reference "now" (which is the frozen
 * demo clock while the mock layer is on).
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Whole calendar days between two instants (ignores the time of day). */
export function calendarDayDiff(iso: string, now: Date): number {
  const then = startOfDay(new Date(iso));
  return Math.round((startOfDay(now) - then) / 86_400_000);
}

function monthDay(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** `12m`, `2 min`, `Today`, `Yesterday`, `Mar 14`. */
export function relativeTime(iso: string, now: Date, style: 'short' | 'long' = 'short'): string {
  const date = new Date(iso);
  const diff = now.getTime() - date.getTime();

  if (diff < MINUTE) {
    return 'Just now';
  }
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return style === 'short' ? `${minutes}m` : `${minutes} min`;
  }
  if (calendarDayDiff(iso, now) === 0) {
    return 'Today';
  }
  return dayLabel(iso, now);
}

/** Day separator label: `TODAY`, `YESTERDAY`, `MAR 14`. */
export function dayLabel(iso: string, now: Date): string {
  const days = calendarDayDiff(iso, now);
  if (days === 0) {
    return 'TODAY';
  }
  if (days === 1) {
    return 'YESTERDAY';
  }
  return monthDay(new Date(iso)).toUpperCase();
}

/** Clock time as shown in the timeline: `9:42 PM`. */
export function clockTime(iso: string): string {
  const date = new Date(iso);
  const hours24 = date.getHours();
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} ${suffix}`;
}

/** `Mar 24`. */
export function shortDate(iso: string): string {
  return monthDay(new Date(iso));
}

/** `Jul 2026`. */
export function monthYear(iso: string): string {
  const date = new Date(iso);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** `Mar 1` — used by the round-up chart axis. */
export function dayMonth(iso: string): string {
  return monthDay(new Date(iso));
}

/** `Due in 4 days` / `Due tomorrow` / `Due Mar 24`. */
export function dueLabel(iso: string, now: Date): string {
  const days = Math.round(
    (startOfDay(new Date(iso)) - startOfDay(now)) / 86_400_000,
  );
  if (days < 0) {
    return 'Overdue';
  }
  if (days === 0) {
    return 'Due today';
  }
  if (days === 1) {
    return 'Due tomorrow';
  }
  if (days <= 7) {
    return `Due in ${days} days`;
  }
  return `Due ${shortDate(iso)}`;
}

const LONG_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const LONG_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/** `Monday, March 16` — the dashboard eyebrow. */
export function longDayLabel(now: Date): string {
  return `${LONG_WEEKDAYS[now.getDay()]}, ${LONG_MONTHS[now.getMonth()]} ${now.getDate()}`;
}

/** Uppercase version used by the design ("MONDAY, MARCH 16"). */
export function longDayLabelUpper(now: Date): string {
  return longDayLabel(now).toUpperCase();
}

/** `March 2026` — timeline section heading. */
export function longMonthYear(iso: string): string {
  const date = new Date(iso);
  return `${LONG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** `March 2026` — timeline section heading. */
export function upperMonthYear(iso: string): string {
  return monthYear(iso).toUpperCase();
}

export { WEEKDAYS };
