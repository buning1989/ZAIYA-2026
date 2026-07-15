const WEEKDAY_CHARS = ["日", "一", "二", "三", "四", "五", "六"];

function formatHHMM(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(date: Date, reference: Date): boolean {
  const yesterday = new Date(reference);
  yesterday.setDate(reference.getDate() - 1);
  return isSameCalendarDay(date, yesterday);
}

export function formatDialogTimeForReference(
  date: Date,
  reference: Date,
): string {
  const hhmm = formatHHMM(date);

  if (isSameCalendarDay(date, reference)) {
    return `今天 ${hhmm}`;
  }

  if (isYesterday(date, reference)) {
    return `昨天 ${hhmm}`;
  }

  return `周${WEEKDAY_CHARS[date.getDay()]} ${hhmm}`;
}
