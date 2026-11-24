import assert from "node:assert/strict";
import test from "node:test";
import { AUDIT_DETAIL_KEYS, appendAudit, sanitizeAuditDetail } from "./audit.js";
import type { QueryClient } from "./types.js";

test("audit detail is allowlisted and redacted", () => {
  const sanitised = sanitizeAuditDetail({
    status: "Contact: mika@example.jp or 03-1234-5678",
    count: 2,
    company: "秘密",
    note: "personal note",
  });
  assert.deepEqual(sanitised, { status: "Contact: [redacted] or [redacted]", count: 2 });
  assert.equal(Object.keys(sanitised).every((key) => AUDIT_DETAIL_KEYS.has(key)), true);
});

test("audit insert uses the sanitised detail", async () => {
  let captured: unknown[] = [];
  const client: QueryClient = {
    query: async (_sql, values = []) => {
      captured = values;
      return { rows: [] };
    },
  };
  await appendAudit(client, {
    actor: "user-admin-1",
    action: "lead_marked_bad",
    entity: "lead",
    entityId: "00000000-0000-0000-0000-000000000001",
    detail: { reason_code: "wrong_phone", email: "someone@example.jp" },
  });
  assert.equal(JSON.stringify(captured).includes("someone@example.jp"), false);
  assert.equal(JSON.stringify(captured).includes("wrong_phone"), true);
});
