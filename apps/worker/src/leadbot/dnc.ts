import type { DncCandidate, DncKind, QueryClient } from "./types.js";
import { queryRows } from "./types.js";
import {
  normalizeCorporateNumber,
  normalizeDomain,
  normalizeNameKey,
  normalizePhone,
} from "./normalize.js";

export function normalizeDncValue(kind: DncKind, value: string): string | null {
  if (kind === "corporate_number") return normalizeCorporateNumber(value);
  if (kind === "domain") return normalizeDomain(value);
  if (kind === "phone") {
    const phone = normalizePhone(value);
    return phone ? phone.replace(/\D/g, "") : null;
  }
  const nameKey = normalizeNameKey(value);
  return nameKey.length > 0 ? nameKey : null;
}

export async function isDncBlocked(
  client: QueryClient,
  kind: DncKind,
  value: string,
): Promise<boolean> {
  const valueNorm = normalizeDncValue(kind, value);
  if (!valueNorm) return false;
  const result = await client.query(
    "SELECT 1 FROM do_not_contact WHERE kind = $1 AND value_norm = $2 LIMIT 1",
    [kind, valueNorm],
  );
  return queryRows(result).length > 0;
}

export async function isAnyDncBlocked(
  client: QueryClient,
  candidates: DncCandidate[],
): Promise<boolean> {
  for (const candidate of candidates) {
    if (await isDncBlocked(client, candidate.kind, candidate.value)) return true;
  }
  return false;
}

export async function addDncEntry(
  client: QueryClient,
  input: {
    kind: DncKind;
    value: string;
    reason: string;
    origin: "request" | "bounce" | "manual" | "bad_lead";
    addedBy?: string | null;
  },
): Promise<string | null> {
  const valueNorm = normalizeDncValue(input.kind, input.value);
  if (!valueNorm) return null;
  await client.query(
    `INSERT INTO do_not_contact (kind, value_norm, reason, origin, added_by)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (kind, value_norm) DO NOTHING`,
    [input.kind, valueNorm, input.reason, input.origin, input.addedBy ?? null],
  );
  return valueNorm;
}
