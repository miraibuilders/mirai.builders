import { createHmac } from "node:crypto";
import type { DncKind, QueryClient } from "./types.js";
import { queryRows } from "./types.js";

const DEV_ERASURE_SECRET = "mirai-lab-dev-erasure-secret-not-for-production";

export function getErasureSecret(): string {
  const secret = process.env.ERASURE_HMAC_SECRET;
  if (secret && secret.length > 0) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ERASURE_HMAC_SECRET is required in production");
  }
  return DEV_ERASURE_SECRET;
}

export function tombstoneDigest(
  kind: DncKind,
  valueNorm: string,
  secret: string = getErasureSecret(),
): string {
  return createHmac("sha256", secret).update(`${kind}:${valueNorm}`).digest("hex");
}

export async function addTombstone(
  client: QueryClient,
  kind: DncKind,
  valueNorm: string,
  secret?: string,
): Promise<string> {
  const digest = tombstoneDigest(kind, valueNorm, secret);
  await client.query(
    "INSERT INTO erasure_tombstones (digest) VALUES ($1) ON CONFLICT (digest) DO NOTHING",
    [digest],
  );
  return digest;
}

export async function isTombstoned(
  client: QueryClient,
  kind: DncKind,
  valueNorm: string,
  secret?: string,
): Promise<boolean> {
  const digest = tombstoneDigest(kind, valueNorm, secret);
  const result = await client.query("SELECT 1 FROM erasure_tombstones WHERE digest = $1", [digest]);
  return queryRows(result).length > 0;
}
