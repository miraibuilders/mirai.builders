import assert from "node:assert/strict";
import test from "node:test";
import { getPool } from "@mirai/db";

type SimpleClient = {
  query(sql: string, values?: unknown[]): Promise<unknown>;
};

async function withRollback(run: (client: SimpleClient) => Promise<void>): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await run(client);
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
}

test("source_records insert without provenance fails a DB constraint", async () => {
  await withRollback(async (client) => {
    await assert.rejects(
      () =>
        client.query(
          "INSERT INTO source_records (source, source_key, payload) VALUES ('nta', 'lb1-probe', '{}'::jsonb)",
        ),
      /null value in column|not-null constraint/i,
    );
  });
});

test("lead_fields insert without provenance fails a DB constraint", async () => {
  await withRollback(async (client) => {
    const inserted = (await client.query(
      "INSERT INTO leads (company, website_url, segment) VALUES ('LB1 provenance probe', '', 'other') RETURNING id",
    )) as { rows: { id: string }[] };
    const leadId = inserted.rows[0]?.id;
    assert.ok(leadId);
    await assert.rejects(
      () =>
        client.query(
          "INSERT INTO lead_fields (lead_id, field, value, confidence) VALUES ($1, 'company', 'probe', 0.9)",
          [leadId],
        ),
      /null value in column|not-null constraint/i,
    );
  });
});

test("source cannot be enabled without a terms snapshot at DB level", async () => {
  await withRollback(async (client) => {
    await assert.rejects(
      () => client.query("INSERT INTO source_state (source, enabled) VALUES ('nta', true)"),
      /source_state_terms_snapshot_check/i,
    );
  });
});

test("do_not_contact unique key is enforced", async () => {
  await withRollback(async (client) => {
    const insert =
      "INSERT INTO do_not_contact (kind, value_norm, reason, origin) VALUES ('phone', '81300000001', 'probe', 'manual')";
    await client.query(insert);
    await assert.rejects(() => client.query(insert), /duplicate key|unique constraint/i);
  });
});

test("erasure_tombstones has no plaintext columns", async () => {
  await withRollback(async (client) => {
    const result = (await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'erasure_tombstones'",
    )) as { rows: { column_name: string }[] };
    assert.deepEqual(
      result.rows.map((row) => row.column_name).sort(),
      ["created_at", "digest"],
    );
  });
});
