const DAY = 86400000;

/** True when the ISO date is within the last `days` days. */
export function isRecent(iso: string | undefined | null, days = 7, now = Date.now()) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && now - t < days * DAY;
}
