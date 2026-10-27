export const LONG_DATE = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "long",
  timeZone: "Asia/Manila",
});

/** Formats a "YYYY-MM-DD" calendar date as a Manila date. */
export function formatDay(day: string) {
  return LONG_DATE.format(new Date(day + "T12:00:00+08:00"));
}
