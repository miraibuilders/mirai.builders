import type { QueryClient } from "./types.js";

export const AUDIT_DETAIL_KEYS = new Set([
  "action",
  "source",
  "mode",
  "count",
  "status",
  "reason_code",
  "task_type",
  "segment",
  "key_kind",
  "snapshot_id",
  "run_id",
  "fields",
]);

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /(?:\+81|0)\d{0,3}-?\d{2,4}-?\d{3,4}/g;

export function sanitizeAuditDetail(detail: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(detail)) {
    if (!AUDIT_DETAIL_KEYS.has(key)) continue;
    if (typeof value === "string") {
      result[key] = value.replace(EMAIL_PATTERN, "[redacted]").replace(PHONE_PATTERN, "[redacted]");
    } else if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      result[key] = value;
    }
  }
  return result;
}

export async function appendAudit(
  client: QueryClient,
  input: {
    actor?: string | null;
    action: string;
    entity: string;
    entityId?: string | null;
    detail?: Record<string, unknown>;
  },
): Promise<void> {
  const detail = sanitizeAuditDetail(input.detail ?? {});
  await client.query(
    `INSERT INTO audit_log (actor, action, entity, entity_id, detail)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [input.actor ?? null, input.action, input.entity, input.entityId ?? null, JSON.stringify(detail)],
  );
}
