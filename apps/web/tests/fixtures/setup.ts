import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { FullConfig } from "@playwright/test";

const root = path.resolve(process.cwd(), "../..");
const pidFile = path.join(root, "state", "evidence", "hardening", "servers.json");
const stubFile = path.join(process.cwd(), "tests", "fixtures", "stub-server.mjs");

async function waitFor(url: string): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      execFileSync("sleep", ["0.1"]);
    }
  }
  throw new Error(`fixture ${url} did not become ready`);
}

export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3000";
  const health = await fetch(`${baseURL}/api/health`);
  if (!health.ok) {
    throw new Error("start pnpm --filter web dev and pnpm --filter worker dev before running");
  }
  execFileSync(
    "psql",
    ["-h", "127.0.0.1", "-p", "5433", "-U", "postgres", "-d", "mirai_lab", "-At", "-c", "SELECT 1"],
    { env: { ...process.env, PGPASSWORD: "postgres" }, stdio: "ignore" },
  );

  for (const url of ["http://127.0.0.1:4010/_health", "http://127.0.0.1:4020/"]) {
    try {
      const response = await fetch(url);
      if (response.ok) throw new Error(`${url} is already occupied; stop the existing stub first`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("already occupied")) throw error;
    }
  }

  const children = ["indexnow", "scanner"].map((mode) =>
    spawn(process.execPath, [stubFile, mode], {
      cwd: root,
      detached: true,
      stdio: "ignore",
    }),
  );
  children.forEach((child) => child.unref());

  await waitFor("http://127.0.0.1:4010/_health");
  await waitFor("http://127.0.0.1:4020/");

  mkdirSync(path.dirname(pidFile), { recursive: true });
  writeFileSync(pidFile, JSON.stringify(children.map((child) => child.pid)));
}
