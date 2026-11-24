import { readFileSync, rmSync } from "node:fs";
import path from "node:path";

const pidFile = path.resolve(process.cwd(), "../..", "state", "evidence", "hardening", "servers.json");

export default async function globalTeardown(): Promise<void> {
  let pids: number[] = [];
  try {
    pids = JSON.parse(readFileSync(pidFile, "utf8")) as number[];
  } catch {
    return;
  }
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      process.kill(pid, "SIGKILL");
    }
  }
  rmSync(pidFile, { force: true });
}
