import {
  differenceInCalendarDays,
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";

const DAY = 86_400_000;

/** ISO string N days from now (negative = past). Used by mock fixtures. */
export const daysFromNow = (n: number) => new Date(Date.now() + n * DAY).toISOString();
export const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();
export const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

export const formatShortDate = (iso: string) => format(new Date(iso), "MMM d");
export const formatLongDate = (iso: string) => format(new Date(iso), "MMM d, yyyy");

/** "20m ago", "3h ago", "2d ago" */
export function timeAgo(iso: string) {
  const s = formatDistanceToNowStrict(new Date(iso));
  const [n, unit] = s.split(" ");
  const short: Record<string, string> = {
    second: "s", seconds: "s", minute: "m", minutes: "m", hour: "h", hours: "h",
    day: "d", days: "d", month: "mo", months: "mo", year: "y", years: "y",
  };
  return `${n}${short[unit] ?? unit} ago`;
}

/** "Today", "Tomorrow", "In 3d", "2d overdue", or a date */
export function dueLabel(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  const diff = differenceInCalendarDays(d, new Date());
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff <= 7) return `In ${diff}d`;
  return formatShortDate(iso);
}

/** Filter bucket for deadlines */
export function deadlineBucket(iso: string): "overdue" | "soon" | "later" {
  const d = differenceInCalendarDays(new Date(iso), new Date());
  return d < 0 ? "overdue" : d <= 14 ? "soon" : "later";
}

/** "week" when within the past 7 days, otherwise "older" */
export const ageBucket = (iso: string): "week" | "older" =>
  differenceInCalendarDays(new Date(), new Date(iso)) <= 7 ? "week" : "older";

export const isOverdue = (iso: string) =>
  differenceInCalendarDays(new Date(iso), new Date()) < 0;

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
