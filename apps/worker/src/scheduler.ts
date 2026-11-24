import {
  intervalHoursFromEnv,
  intervalMsFromHours,
  normalizeDomain,
  SCAN_DOMAIN_COOLDOWN_MINUTES,
} from "@mirai/db";

type SchedulerPool = {
  query(sql: string, values?: unknown[]): Promise<{ rows: unknown[] }>;
};

type ScheduledCandidate = {
  id: string;
  websiteUrl: string;
  latestScanAt: Date | null;
};

type ChosenCandidate = ScheduledCandidate & { domain: string };

export type CronEnqueueResult = {
  firedAt: Date;
  enqueued: { scanId: string; leadId: string; domain: string }[];
  skippedDuplicates: number;
  skippedCooldown: number;
};

function cooldownMinutesFromEnv(): number {
  const parsed = Number(process.env.SCAN_DOMAIN_COOLDOWN_MINUTES ?? SCAN_DOMAIN_COOLDOWN_MINUTES);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : SCAN_DOMAIN_COOLDOWN_MINUTES;
}

export function chooseScheduledLeads(
  candidates: ScheduledCandidate[],
  activeLeadIds: Set<string>,
  recentDomains: Set<string>,
  now: Date,
  intervalHours: number,
): { chosen: ChosenCandidate[]; skippedDuplicates: number; skippedCooldown: number } {
  const cutoff = now.getTime() - intervalMsFromHours(intervalHours);
  const chosen: ChosenCandidate[] = [];
  const seenDomains = new Set<string>();
  let skippedDuplicates = 0;
  let skippedCooldown = 0;

  for (const candidate of candidates) {
    if (candidate.latestScanAt && candidate.latestScanAt.getTime() >= cutoff) continue;
    const domain = normalizeDomain(candidate.websiteUrl);
    if (!domain) continue;
    if (activeLeadIds.has(candidate.id)) {
      skippedDuplicates += 1;
      continue;
    }
    if (recentDomains.has(domain) || seenDomains.has(domain)) {
      skippedCooldown += 1;
      continue;
    }
    seenDomains.add(domain);
    chosen.push({ ...candidate, domain });
  }

  return { chosen, skippedDuplicates, skippedCooldown };
}

export async function enqueueScheduledScans(
  pool: SchedulerPool,
  options: { now?: Date; intervalHours?: number; cooldownMinutes?: number } = {},
): Promise<CronEnqueueResult> {
  const now = options.now ?? new Date();
  const intervalHours = options.intervalHours ?? intervalHoursFromEnv(process.env.SCAN_INTERVAL_HOURS);
  const cooldownMinutes = options.cooldownMinutes ?? cooldownMinutesFromEnv();
  const cutoff = new Date(now.getTime() - intervalMsFromHours(intervalHours));
  const cooldownSince = new Date(now.getTime() - cooldownMinutes * 60000);

  const [candidateRows, activeRows, recentRows] = await Promise.all([
    pool.query(
      `SELECT l.id AS "id", l.website_url AS "websiteUrl", l.latest_scan_at AS "latestScanAt"
       FROM leads l
       WHERE l.website_url IS NOT NULL AND btrim(l.website_url) <> ''
         AND (l.latest_scan_at IS NULL OR l.latest_scan_at < $1)
       ORDER BY l.created_at`,
      [cutoff],
    ),
    pool.query(
      `SELECT DISTINCT lead_id AS "leadId" FROM scans WHERE status IN ('queued', 'running')`,
    ),
    pool.query(
      `SELECT l.website_url AS "websiteUrl"
       FROM scans s JOIN leads l ON l.id = s.lead_id
       WHERE s.created_at > $1`,
      [cooldownSince],
    ),
  ]);

  const activeLeadIds = new Set(
    activeRows.rows.map((row) => (row as { leadId: string }).leadId),
  );
  const recentDomains = new Set(
    recentRows.rows
      .map((row) => normalizeDomain((row as { websiteUrl: string }).websiteUrl))
      .filter((value): value is string => Boolean(value)),
  );
  const selection = chooseScheduledLeads(
    candidateRows.rows as ScheduledCandidate[],
    activeLeadIds,
    recentDomains,
    now,
    intervalHours,
  );

  const enqueued: CronEnqueueResult["enqueued"] = [];
  for (const candidate of selection.chosen) {
    const inserted = await pool.query(
      `INSERT INTO scans (lead_id, kind, status, created_at, updated_at)
       VALUES ($1, 'scan', 'queued', $2, $2)
       RETURNING id`,
      [candidate.id, now],
    );
    const scanId = (inserted.rows[0] as { id: string }).id;
    enqueued.push({ scanId, leadId: candidate.id, domain: candidate.domain });
  }

  return {
    firedAt: now,
    enqueued,
    skippedDuplicates: selection.skippedDuplicates,
    skippedCooldown: selection.skippedCooldown,
  };
}

export async function runCronTick(
  pool: SchedulerPool,
  source: "startup" | "interval" | "test-startup",
): Promise<CronEnqueueResult> {
  const result = await enqueueScheduledScans(pool);
  console.log(`worker: cron fired at ${result.firedAt.toISOString()} source=${source}`);
  for (const item of result.enqueued) {
    console.log(
      `worker: cron enqueued scan=${item.scanId} lead=${item.leadId} domain=${item.domain} created_at=${result.firedAt.toISOString()}`,
    );
  }
  console.log(
    `worker: cron tick complete enqueued=${result.enqueued.length} skipped_duplicates=${result.skippedDuplicates} skipped_cooldown=${result.skippedCooldown}`,
  );
  return result;
}

export async function startScheduler(pool: SchedulerPool): Promise<() => void> {
  const intervalHours = intervalHoursFromEnv(process.env.SCAN_INTERVAL_HOURS);
  const intervalMs = intervalMsFromHours(intervalHours);

  if (process.env.SCAN_CRON_TEST === "1") {
    console.log("worker: SCAN_CRON_TEST=1 enabled (test-only); firing scheduled enqueue at startup");
    await runCronTick(pool, "test-startup");
  }

  const timer = setInterval(() => {
    void runCronTick(pool, "interval").catch((error) => {
      console.error(
        "worker: cron enqueue failed",
        error instanceof Error ? error.message : "unknown error",
      );
    });
  }, intervalMs);

  return () => clearInterval(timer);
}
