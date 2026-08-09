export const FALLBACK_TIME_ZONE = "America/New_York";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const SHORT_MONTH_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const pad = (value) => String(value).padStart(2, "0");

export function isValidTimeZone(timeZone) {
  if (!timeZone) return false;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function getUserTimeZone() {
  const savedTimeZone =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("userTimeZone") || localStorage.getItem("timezone")
      : null;

  if (isValidTimeZone(savedTimeZone)) return savedTimeZone;

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return isValidTimeZone(browserTimeZone) ? browserTimeZone : FALLBACK_TIME_ZONE;
}

export function getLocalDateStr(date = new Date(), timeZone = getUserTimeZone()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type)?.value;
  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

export function getDateStrFromValue(value, timeZone = getUserTimeZone()) {
  if (!value) return getLocalDateStr(new Date(), timeZone);
  if (value instanceof Date) return getLocalDateStr(value, timeZone);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return getLocalDateStr(new Date(value), timeZone);
}

export function getWeekdayName(date = new Date(), timeZone = getUserTimeZone()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
  }).format(date);
}

export function getWeekdayNameForDateStr(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

export function addDaysToDateStr(dateStr, days) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function getDateStrDaysAgo(daysAgo, date = new Date(), timeZone = getUserTimeZone()) {
  return addDaysToDateStr(getLocalDateStr(date, timeZone), -daysAgo);
}

export function getDateStrForWeekday(dayName, date = new Date(), timeZone = getUserTimeZone()) {
  const targetDay = WEEKDAYS.indexOf(dayName);
  if (targetDay === -1) return getLocalDateStr(date, timeZone);

  const currentDay = WEEKDAYS.indexOf(getWeekdayName(date, timeZone));
  const diff = (targetDay - currentDay + 7) % 7;
  return addDaysToDateStr(getLocalDateStr(date, timeZone), diff);
}

export function getStartOfWeekDateStr(date = new Date(), timeZone = getUserTimeZone()) {
  const todayStr = getLocalDateStr(date, timeZone);
  const currentDay = WEEKDAYS.indexOf(getWeekdayName(date, timeZone));
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  return addDaysToDateStr(todayStr, mondayOffset);
}

export function formatMonthDayDateStr(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return SHORT_MONTH_FORMAT.format(new Date(Date.UTC(year, month - 1, day)));
}

export function getMsUntilNextUserMidnight(date = new Date(), timeZone = getUserTimeZone()) {
  const nowTime = date.getTime();
  const tomorrowStr = addDaysToDateStr(getLocalDateStr(date, timeZone), 1);
  let low = nowTime;
  let high = nowTime + 36 * 60 * 60 * 1000;

  while (getLocalDateStr(new Date(high), timeZone) !== tomorrowStr) {
    high += 6 * 60 * 60 * 1000;
  }

  while (high - low > 1000) {
    const mid = Math.floor((low + high) / 2);
    if (getLocalDateStr(new Date(mid), timeZone) === tomorrowStr) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.max(0, high - nowTime);
}
