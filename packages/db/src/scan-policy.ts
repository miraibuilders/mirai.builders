export const DEFAULT_SCAN_INTERVAL_HOURS = 24;
export const SCAN_DOMAIN_COOLDOWN_MINUTES = 15;
export const SCAN_MANUAL_COOLDOWN_MINUTES = 15;

export type ScanKind = "scan" | "detail";

export function intervalHoursFromEnv(value: string | undefined): number {
  if (value === undefined || value.trim() === "") return DEFAULT_SCAN_INTERVAL_HOURS;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SCAN_INTERVAL_HOURS;
}

export function intervalMsFromHours(hours: number): number {
  return Math.max(1, Math.floor(hours * 60 * 60 * 1000));
}

export function normalizeDomain(websiteUrl: string): string | null {
  try {
    const hostname = new URL(websiteUrl).hostname.toLowerCase().replace(/\.$/, "");
    return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  } catch {
    return null;
  }
}

export function cooldownRemainingMinutes(
  lastAt: Date,
  now: Date = new Date(),
  cooldownMinutes: number = SCAN_MANUAL_COOLDOWN_MINUTES,
): number {
  const elapsedMinutes = (now.getTime() - lastAt.getTime()) / 60000;
  return Math.max(1, Math.ceil(cooldownMinutes - elapsedMinutes));
}

export function isInCooldown(
  lastAt: Date,
  now: Date = new Date(),
  cooldownMinutes: number = SCAN_MANUAL_COOLDOWN_MINUTES,
): boolean {
  return now.getTime() - lastAt.getTime() < cooldownMinutes * 60000;
}

export function cooldownMessage(waitMinutes: number): string {
  return `scan ran recently; wait ${waitMinutes} minutes`;
}
