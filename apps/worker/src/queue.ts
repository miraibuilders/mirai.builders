import { getPool, type ScanKind } from "@mirai/db";
import type { LeadReachability, LeadSegment } from "./scanner/types.js";

export type ClaimedJob = {
  id: string;
  leadId: string;
  kind: ScanKind;
  queuedAt: Date;
  websiteUrl: string;
  segment: LeadSegment;
  reachability: LeadReachability;
  sizeProxy: number;
};

export async function claimNextScan(pool: ReturnType<typeof getPool>): Promise<ClaimedJob | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query<ClaimedJob>(`
      SELECT
        s.id,
        s.lead_id AS "leadId",
        s.kind,
        s.created_at AS "queuedAt",
        l.website_url AS "websiteUrl",
        l.segment,
        l.reachability,
        l.size_proxy AS "sizeProxy"
      FROM scans s
      JOIN leads l ON l.id = s.lead_id
      WHERE s.status = 'queued'
      ORDER BY s.created_at
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    `);
    const job = found.rows[0];
    if (!job) {
      await client.query("ROLLBACK");
      return null;
    }
    await client.query("UPDATE scans SET status = 'running', updated_at = now() WHERE id = $1", [job.id]);
    await client.query("COMMIT");
    return job;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function failScan(pool: ReturnType<typeof getPool>, scanId: string): Promise<void> {
  await pool.query(
    "UPDATE scans SET status = 'failed', result_json = $1, updated_at = now() WHERE id = $2",
    [JSON.stringify({ status: "failed", error: "SCAN_FAILED" }), scanId],
  );
}
