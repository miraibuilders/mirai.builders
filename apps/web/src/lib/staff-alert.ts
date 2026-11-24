type StaffAlertDetails = {
  route?: string;
  reason?: string;
  digest?: string;
};

const ALERT_THROTTLE_MS = 5 * 60 * 1000;
const lastAlertAt = new Map<string, number>();

function alertKey(kind: string, details: StaffAlertDetails): string {
  return `${kind}:${details.route ?? "unknown"}:${details.reason ?? "none"}`;
}

function safeText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 120) : undefined;
}

export async function notifyStaff(
  kind: string,
  details: StaffAlertDetails = {},
  error?: unknown,
): Promise<void> {
  console.error("[STAFF_ALERT]", kind, details, error ?? "");

  const webhook = safeText(process.env.STAFF_ALERT_WEBHOOK_URL);
  if (!webhook) return;

  const key = alertKey(kind, details);
  const now = Date.now();
  if (now - (lastAlertAt.get(key) ?? 0) < ALERT_THROTTLE_MS) return;
  lastAlertAt.set(key, now);

  const environment = process.env.NODE_ENV === "production" ? "production" : "development";
  const route = safeText(details.route);
  const reason = safeText(details.reason);
  const digest = safeText(details.digest);
  const parts = [kind, route, reason, digest].filter(Boolean).join(" | ");
  const text = `[MIRAI Lab ${environment}] ${parts}`;

  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
  } catch (deliveryError) {
    console.error("[STAFF_ALERT_DELIVERY_FAILED]", deliveryError);
  }
}
