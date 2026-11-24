import "dotenv/config";
import { getPool } from "@mirai/db";
import { buildDetailBrief } from "./detail-brief.js";
import { writeDetailBrief, writeScanResult } from "./persist.js";
import { claimNextScan, failScan } from "./queue.js";
import { scanWebsite, scanWebsiteDetailed } from "./scanner/scan.js";
import { scoreScan } from "./scoring/score.js";
import { startScheduler } from "./scheduler.js";

const POLL_INTERVAL_MS = Number(process.env.SCAN_POLL_MS ?? 1000);
let stopped = false;

if (process.env.SCAN_CRON_TEST === "1" && process.env.NODE_ENV === "production") {
  throw new Error("SCAN_CRON_TEST=1 is not allowed in production");
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processOne(): Promise<boolean> {
  const pool = getPool();
  const job = await claimNextScan(pool);
  if (!job) return false;

  const processedAt = new Date();
  console.log(
    `worker: processing job=${job.id} kind=${job.kind} queued_at=${job.queuedAt.toISOString()} at=${processedAt.toISOString()}`,
  );

  try {
    if (job.kind === "detail") {
      const result = await scanWebsiteDetailed(job.websiteUrl);
      const score = scoreScan({
        scan: result,
        lead: {
          segment: job.segment,
          reachability: job.reachability,
          websitePresent: true,
          sizeProxy: job.sizeProxy,
        },
      });
      await writeDetailBrief(pool, {
        scanId: job.id,
        leadId: job.leadId,
        result,
        score,
        brief: buildDetailBrief(result),
        completedAt: processedAt,
      });
      console.log(`worker: completed detail=${job.id} at=${processedAt.toISOString()}`);
      return true;
    }

    const result = await scanWebsite(job.websiteUrl);
    const score = scoreScan({
      scan: result,
      lead: {
        segment: job.segment,
        reachability: job.reachability,
        websitePresent: true,
        sizeProxy: job.sizeProxy,
      },
    });
    await writeScanResult(pool, {
      scanId: job.id,
      leadId: job.leadId,
      result,
      score,
      completedAt: processedAt,
    });
    console.log(`worker: completed scan=${job.id} at=${processedAt.toISOString()}`);
    return true;
  } catch (error) {
    await failScan(pool, job.id);
    console.error(
      `worker: failed job=${job.id} at=${new Date().toISOString()}`,
      error instanceof Error ? error.message : "unknown error",
    );
    return true;
  }
}

async function main(): Promise<void> {
  const pool = getPool();
  await pool.query("SELECT 1");
  console.log("worker: started");
  const stopScheduler = await startScheduler(pool);

  while (!stopped) {
    const processed = await processOne();
    if (!processed) await delay(POLL_INTERVAL_MS);
  }

  stopScheduler();
  await pool.end();
  console.log("worker: stopped");
}

process.on("SIGINT", () => {
  stopped = true;
});
process.on("SIGTERM", () => {
  stopped = true;
});

main().catch((error) => {
  console.error("worker: startup failed", error instanceof Error ? error.message : "unknown error");
  process.exit(1);
});
