import { toStoredDetailScanResult, toStoredScanResult } from "./scanner/allowlist.js";
import type { DetailScanResult, ScanResult, ScoreResult } from "./scanner/types.js";

export type QueryClient = {
  query(sql: string, values?: unknown[]): Promise<unknown>;
};

export type CapturedQuery = {
  sql: string;
  values: unknown[];
};

export async function writeScanResult(
  client: QueryClient,
  options: {
    scanId: string;
    leadId: string;
    result: ScanResult;
    score: ScoreResult;
    completedAt?: Date;
  },
): Promise<void> {
  const stored = toStoredScanResult(options.result, options.score);
  const completedAt = options.completedAt ?? new Date();
  const queries: CapturedQuery[] = [
    { sql: "BEGIN", values: [] },
    {
      sql: "UPDATE scans SET status = 'done', result_json = $1, updated_at = $3 WHERE id = $2",
      values: [JSON.stringify(stored), options.scanId, completedAt],
    },
    {
      sql: "UPDATE leads SET score = $1, pain_flags = $2, latest_scan_at = $3, latest_scan_status = 'done', updated_at = $3 WHERE id = $4",
      values: [options.score.score, options.score.painFlags, completedAt, options.leadId],
    },
    { sql: "COMMIT", values: [] },
  ];

  for (const query of queries) {
    await client.query(query.sql, query.values);
  }
}

export async function writeDetailBrief(
  client: QueryClient,
  options: {
    scanId: string;
    leadId: string;
    result: DetailScanResult;
    score: ScoreResult;
    brief: string;
    completedAt?: Date;
  },
): Promise<void> {
  const stored = toStoredDetailScanResult(options.result, options.score);
  const completedAt = options.completedAt ?? new Date();
  const queries: CapturedQuery[] = [
    { sql: "BEGIN", values: [] },
    {
      sql: "UPDATE scans SET status = 'done', result_json = $1, updated_at = $3 WHERE id = $2",
      values: [JSON.stringify(stored), options.scanId, completedAt],
    },
    {
      sql: "UPDATE leads SET score = $1, pain_flags = $2, detail_brief_md = $3, latest_scan_at = $4, latest_scan_status = 'done', updated_at = $4 WHERE id = $5",
      values: [
        options.score.score,
        options.score.painFlags,
        options.brief,
        completedAt,
        options.leadId,
      ],
    },
    { sql: "COMMIT", values: [] },
  ];

  for (const query of queries) {
    await client.query(query.sql, query.values);
  }
}
