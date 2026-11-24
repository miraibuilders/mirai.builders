import { and, desc, eq, inArray } from "drizzle-orm";
import { leads, scans, cooldownMessage, cooldownRemainingMinutes, isInCooldown, SCAN_MANUAL_COOLDOWN_MINUTES, type ScanKind } from "@mirai/db";
import { getDb } from "@/lib/db";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type EnqueueScanResult =
  | { ok: true; scanId: string; kind: ScanKind }
  | { ok: false; status: 400 | 404 | 409; error: string; message?: string };

export function normalizeScanKind(value: unknown): ScanKind | null {
  return value === "scan" || value === "detail" ? value : null;
}

export async function enqueueScan(leadId: string, kind: ScanKind = "scan"): Promise<EnqueueScanResult> {
  if (!UUID_PATTERN.test(leadId)) {
    return { ok: false, status: 400, error: "INVALID_LEAD_ID" };
  }

  const [lead] = await getDb()
    .select({ id: leads.id, websiteUrl: leads.websiteUrl })
    .from(leads)
    .where(eq(leads.id, leadId))
    .limit(1);
  if (!lead) {
    return { ok: false, status: 404, error: "LEAD_NOT_FOUND" };
  }
  if (kind === "detail" && !lead.websiteUrl.trim()) {
    return { ok: false, status: 400, error: "LEAD_WEBSITE_REQUIRED" };
  }

  const now = new Date();
  const [recent] = await getDb()
    .select({ createdAt: scans.createdAt })
    .from(scans)
    .where(and(eq(scans.leadId, leadId), eq(scans.status, "done")))
    .orderBy(desc(scans.createdAt))
    .limit(1);
  if (recent && isInCooldown(recent.createdAt, now, SCAN_MANUAL_COOLDOWN_MINUTES)) {
    const waitMinutes = cooldownRemainingMinutes(recent.createdAt, now, SCAN_MANUAL_COOLDOWN_MINUTES);
    return { ok: false, status: 409, error: "SCAN_COOLDOWN", message: cooldownMessage(waitMinutes) };
  }

  const [active] = await getDb()
    .select({ id: scans.id })
    .from(scans)
    .where(and(eq(scans.leadId, leadId), inArray(scans.status, ["queued", "running"])))
    .limit(1);
  if (active) {
    return { ok: false, status: 409, error: "SCAN_ALREADY_QUEUED", message: "scan already queued" };
  }

  const [created] = await getDb()
    .insert(scans)
    .values({ leadId, kind })
    .returning({ id: scans.id });
  return { ok: true, scanId: created.id, kind };
}
